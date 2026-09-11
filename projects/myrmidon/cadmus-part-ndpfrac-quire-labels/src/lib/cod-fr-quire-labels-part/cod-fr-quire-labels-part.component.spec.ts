import { Component, input, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { CodFrQuireLabelsPartComponent } from './cod-fr-quire-labels-part.component';
import { CodFrQuireLabelEditorComponent } from '../cod-fr-quire-label-editor/cod-fr-quire-label-editor.component';
import {
  CodFrQuireLabel,
  CodFrQuireLabelsPart,
} from '../cod-fr-quire-labels-part';

@Component({
  selector: 'cadmus-cod-fr-quire-label-editor',
  template: '',
})
class MockCodFrQuireLabelEditorComponent {
  public readonly typeEntries = input<unknown>();
  public readonly label = model<CodFrQuireLabel | undefined>();
}

describe('CodFrQuireLabelsPartComponent', () => {
  let component: CodFrQuireLabelsPartComponent;
  let fixture: ComponentFixture<CodFrQuireLabelsPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.cod-fr-quire-labels',
    partId: 'part1',
    roleId: null,
  };

  function makeLabel(text: string): CodFrQuireLabel {
    return { types: ['t1'], positions: ['p1'], text };
  }

  function makeData(
    labels: CodFrQuireLabel[],
    thesauri?: ThesauriSet,
  ): EditedObject<CodFrQuireLabelsPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.cod-fr-quire-labels',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        labels,
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
      imports: [CodFrQuireLabelsPartComponent],
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
      .overrideComponent(CodFrQuireLabelsPartComponent, {
        remove: { imports: [CodFrQuireLabelEditorComponent] },
        add: { imports: [MockCodFrQuireLabelEditorComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelsPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('buildForm / validity', () => {
    it('should be invalid with no labels', () => {
      fixture.detectChanges();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with at least one label', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a')]);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should set entries signals when their thesauri are present', async () => {
      fixture.detectChanges();
      const types = [{ id: 't1', value: 'T1' }];
      fixture.componentRef.setInput(
        'data',
        makeData([], {
          'cod-fr-quire-label-types': {
            id: 'cod-fr-quire-label-types',
            entries: types,
          },
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.typeEntries()).toEqual(types);
      expect(component.positionEntries()).toBeUndefined();
    });

    it('should clear entries signals when their thesauri are absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([], {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.typeEntries()).toBeUndefined();
      expect(component.idFeatureEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (settings)', () => {
    it('should set lookupProviderOptions from the app repository settings', async () => {
      const options = { providers: [] };
      appRepository.getSettingFor.mockResolvedValue({
        lookupProviderOptions: options,
      });
      fixture.detectChanges();

      fixture.componentRef.setInput('data', makeData([]));
      fixture.detectChanges();
      await fixture.whenStable();
      await Promise.resolve();

      expect(appRepository.getSettingFor).toHaveBeenCalledWith(
        'it.vedph.ndp.cod-fr-quire-labels',
        undefined,
      );
      expect(component.lookupProviderOptions()).toEqual(options);
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a')]);

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.labels.value).toEqual([]);
    });

    it('should populate labels from part.labels and mark the form pristine', async () => {
      fixture.detectChanges();
      const labels = [makeLabel('a'), makeLabel('b')];

      fixture.componentRef.setInput('data', makeData(labels));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.labels.value).toEqual(labels);
      expect(component.form.pristine).toBe(true);
    });
  });

  describe('getValue', () => {
    it('should return the edited part with current labels', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([makeLabel('a')]));
      fixture.detectChanges();
      await fixture.whenStable();

      component.labels.setValue([makeLabel('a'), makeLabel('b')]);
      const value = (component as any).getValue() as CodFrQuireLabelsPart;

      expect(value.id).toBe('part1');
      expect(value.labels).toEqual([makeLabel('a'), makeLabel('b')]);
    });
  });

  describe('addLabel / editLabel / closeLabel', () => {
    it('should open the editor for a new empty label', () => {
      fixture.detectChanges();

      component.addLabel();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toEqual({ types: [], positions: [] });
    });

    it('should open the editor for an existing label as a deep clone', () => {
      fixture.detectChanges();
      const label = makeLabel('a');

      component.editLabel(label, 2);

      expect(component.editedIndex()).toBe(2);
      expect(component.edited()).toEqual(label);
      expect(component.edited()).not.toBe(label);
    });

    it('should close the editor', () => {
      fixture.detectChanges();
      component.editLabel(makeLabel('a'), 0);

      component.closeLabel();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  describe('saveLabel', () => {
    it('should append a new label when editedIndex is -1', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a')]);
      component.addLabel();

      component.saveLabel(makeLabel('b'));

      expect(component.labels.value).toEqual([makeLabel('a'), makeLabel('b')]);
      expect(component.labels.dirty).toBe(true);
      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });

    it('should replace the label at editedIndex when editing an existing one', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);
      component.editLabel(makeLabel('b'), 1);

      component.saveLabel(makeLabel('b (edited)'));

      expect(component.labels.value).toEqual([
        makeLabel('a'),
        makeLabel('b (edited)'),
      ]);
    });
  });

  describe('deleteLabel', () => {
    it('should remove the label when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);

      component.deleteLabel(0);

      expect(component.labels.value).toEqual([makeLabel('b')]);
      expect(component.labels.dirty).toBe(true);
    });

    it('should not remove the label when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      component.labels.setValue([makeLabel('a')]);

      component.deleteLabel(0);

      expect(component.labels.value).toEqual([makeLabel('a')]);
    });

    it('should close the editor when deleting the currently edited label', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.labels.setValue([makeLabel('a')]);
      component.editLabel(makeLabel('a'), 0);

      component.deleteLabel(0);

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  // moveLabelUp/moveLabelDown: regression tests for the same editedIndex
  // desync bug found and fixed in the sibling libraries.
  describe('moveLabelUp', () => {
    it('should do nothing when index is 0', () => {
      fixture.detectChanges();
      const labels = [makeLabel('a'), makeLabel('b')];
      component.labels.setValue(labels);

      component.moveLabelUp(0);

      expect(component.labels.value).toEqual(labels);
      expect(component.labels.dirty).toBe(false);
    });

    it('should swap the label with the previous one', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);

      component.moveLabelUp(1);

      expect(component.labels.value).toEqual([makeLabel('b'), makeLabel('a')]);
    });

    it('should keep editedIndex tracking the moved-up label', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);
      component.editLabel(makeLabel('b'), 1);

      component.moveLabelUp(1);

      expect(component.editedIndex()).toBe(0);
    });

    it('should keep editedIndex tracking the displaced label', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);
      component.editLabel(makeLabel('a'), 0);

      component.moveLabelUp(1);

      expect(component.editedIndex()).toBe(1);
    });
  });

  describe('moveLabelDown', () => {
    it('should do nothing when index is the last one', () => {
      fixture.detectChanges();
      const labels = [makeLabel('a'), makeLabel('b')];
      component.labels.setValue(labels);

      component.moveLabelDown(1);

      expect(component.labels.value).toEqual(labels);
      expect(component.labels.dirty).toBe(false);
    });

    it('should swap the label with the next one', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);

      component.moveLabelDown(0);

      expect(component.labels.value).toEqual([makeLabel('b'), makeLabel('a')]);
    });

    it('should keep editedIndex tracking the moved-down label', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);
      component.editLabel(makeLabel('a'), 0);

      component.moveLabelDown(0);

      expect(component.editedIndex()).toBe(1);
    });

    it('should keep editedIndex tracking the displaced label', () => {
      fixture.detectChanges();
      component.labels.setValue([makeLabel('a'), makeLabel('b')]);
      component.editLabel(makeLabel('b'), 1);

      component.moveLabelDown(0);

      expect(component.editedIndex()).toBe(0);
    });
  });
});
