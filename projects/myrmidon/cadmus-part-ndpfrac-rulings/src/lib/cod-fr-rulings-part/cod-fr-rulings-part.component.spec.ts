import { Component, input, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { CodFrRulingsPartComponent } from './cod-fr-rulings-part.component';
import { CodFrRulingEditorComponent } from '../cod-fr-ruling-editor/cod-fr-ruling-editor.component';
import { CodFrRuling, CodFrRulingsPart } from '../cod-fr-rulings-part';

@Component({
  selector: 'cadmus-cod-fr-ruling-editor',
  template: '',
})
class MockCodFrRulingEditorComponent {
  public readonly systemEntries = input<unknown>();
  public readonly ruling = model<CodFrRuling | undefined>();
}

describe('CodFrRulingsPartComponent', () => {
  let component: CodFrRulingsPartComponent;
  let fixture: ComponentFixture<CodFrRulingsPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.cod-fr-rulings',
    partId: 'part1',
    roleId: null,
  };

  function makeRuling(feature: string): CodFrRuling {
    return { features: [feature] };
  }

  function makeData(
    rulings: CodFrRuling[],
    thesauri?: ThesauriSet,
  ): EditedObject<CodFrRulingsPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.cod-fr-rulings',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        rulings,
      },
      thesauri: thesauri || {},
    };
  }

  beforeEach(async () => {
    dialogService = { confirm: vi.fn() };
    appRepository = {
      getSettingFor: vi.fn().mockResolvedValue(undefined),
      getTypeThesaurus: vi.fn().mockReturnValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [CodFrRulingsPartComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthJwtService,
          useValue: { currentUser$: of(null), currentUserValue: null },
        },
        { provide: AppRepository, useValue: appRepository },
        { provide: DialogService, useValue: dialogService },
      ],
    })
      .overrideComponent(CodFrRulingsPartComponent, {
        remove: { imports: [CodFrRulingEditorComponent] },
        add: { imports: [MockCodFrRulingEditorComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrRulingsPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('buildForm / validity', () => {
    it('should be invalid with no rulings', () => {
      fixture.detectChanges();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with at least one ruling', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1')]);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should set entries signals when their thesauri are present', async () => {
      fixture.detectChanges();
      const systems = [{ id: 's1', value: 'S1' }];
      fixture.componentRef.setInput(
        'data',
        makeData([], {
          'cod-fr-ruling-systems': { id: 'cod-fr-ruling-systems', entries: systems },
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.systemEntries()).toEqual(systems);
      expect(component.typeEntries()).toBeUndefined();
    });

    it('should clear entries signals when their thesauri are absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([], {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.systemEntries()).toBeUndefined();
      expect(component.typeEntries()).toBeUndefined();
      expect(component.featureEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1')]);

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.entries.value).toEqual([]);
    });

    it('should populate entries from part.rulings and mark the form pristine', async () => {
      fixture.detectChanges();
      const rulings = [makeRuling('f1'), makeRuling('f2')];

      fixture.componentRef.setInput('data', makeData(rulings));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.entries.value).toEqual(rulings);
      expect(component.form.pristine).toBe(true);
    });
  });

  describe('getValue', () => {
    it('should return the edited part with current entries', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([makeRuling('f1')]));
      fixture.detectChanges();
      await fixture.whenStable();

      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);
      const value = (component as any).getValue() as CodFrRulingsPart;

      expect(value.id).toBe('part1');
      expect(value.rulings).toEqual([makeRuling('f1'), makeRuling('f2')]);
    });
  });

  describe('addRuling / editRuling / closeRuling', () => {
    it('should open the editor for a new ruling with empty features', () => {
      fixture.detectChanges();

      component.addRuling();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toEqual({ features: [] });
    });

    it('should open the editor for an existing ruling as a deep clone', () => {
      fixture.detectChanges();
      const ruling = makeRuling('f1');

      component.editRuling(ruling, 2);

      expect(component.editedIndex()).toBe(2);
      expect(component.edited()).toEqual(ruling);
      expect(component.edited()).not.toBe(ruling);
    });

    it('should close the editor', () => {
      fixture.detectChanges();
      component.editRuling(makeRuling('f1'), 0);

      component.closeRuling();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  describe('saveRuling', () => {
    it('should append a new ruling when editedIndex is -1', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1')]);
      component.addRuling();

      component.saveRuling(makeRuling('f2'));

      expect(component.entries.value).toEqual([
        makeRuling('f1'),
        makeRuling('f2'),
      ]);
      expect(component.entries.dirty).toBe(true);
      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });

    it('should replace the ruling at editedIndex when editing an existing one', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);
      component.editRuling(makeRuling('f2'), 1);

      component.saveRuling({ features: ['f2', 'f3'] });

      expect(component.entries.value).toEqual([
        makeRuling('f1'),
        { features: ['f2', 'f3'] },
      ]);
    });
  });

  describe('deleteRuling', () => {
    it('should remove the ruling when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);

      component.deleteRuling(0);

      expect(component.entries.value).toEqual([makeRuling('f2')]);
      expect(component.entries.dirty).toBe(true);
    });

    it('should not remove the ruling when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      component.entries.setValue([makeRuling('f1')]);

      component.deleteRuling(0);

      expect(component.entries.value).toEqual([makeRuling('f1')]);
    });

    it('should close the editor when deleting the currently edited ruling', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.entries.setValue([makeRuling('f1')]);
      component.editRuling(makeRuling('f1'), 0);

      component.deleteRuling(0);

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  // moveRulingUp/moveRulingDown: regression tests for the same editedIndex
  // desync bug found and fixed in the sibling libraries.
  describe('moveRulingUp', () => {
    it('should do nothing when index is 0', () => {
      fixture.detectChanges();
      const rulings = [makeRuling('f1'), makeRuling('f2')];
      component.entries.setValue(rulings);

      component.moveRulingUp(0);

      expect(component.entries.value).toEqual(rulings);
      expect(component.entries.dirty).toBe(false);
    });

    it('should swap the ruling with the previous one', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);

      component.moveRulingUp(1);

      expect(component.entries.value).toEqual([
        makeRuling('f2'),
        makeRuling('f1'),
      ]);
    });

    it('should keep editedIndex tracking the moved-up ruling', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);
      component.editRuling(makeRuling('f2'), 1);

      component.moveRulingUp(1);

      expect(component.editedIndex()).toBe(0);
    });

    it('should keep editedIndex tracking the displaced ruling', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);
      component.editRuling(makeRuling('f1'), 0);

      component.moveRulingUp(1);

      expect(component.editedIndex()).toBe(1);
    });
  });

  describe('moveRulingDown', () => {
    it('should do nothing when index is the last one', () => {
      fixture.detectChanges();
      const rulings = [makeRuling('f1'), makeRuling('f2')];
      component.entries.setValue(rulings);

      component.moveRulingDown(1);

      expect(component.entries.value).toEqual(rulings);
      expect(component.entries.dirty).toBe(false);
    });

    it('should swap the ruling with the next one', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);

      component.moveRulingDown(0);

      expect(component.entries.value).toEqual([
        makeRuling('f2'),
        makeRuling('f1'),
      ]);
    });

    it('should keep editedIndex tracking the moved-down ruling', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);
      component.editRuling(makeRuling('f1'), 0);

      component.moveRulingDown(0);

      expect(component.editedIndex()).toBe(1);
    });

    it('should keep editedIndex tracking the displaced ruling', () => {
      fixture.detectChanges();
      component.entries.setValue([makeRuling('f1'), makeRuling('f2')]);
      component.editRuling(makeRuling('f2'), 1);

      component.moveRulingDown(0);

      expect(component.editedIndex()).toBe(0);
    });
  });
});
