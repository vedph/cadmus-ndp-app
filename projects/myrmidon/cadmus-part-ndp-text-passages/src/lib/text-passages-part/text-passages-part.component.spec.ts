import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { TextPassagesPartComponent } from './text-passages-part.component';
import { TextPassageEditorComponent } from '../text-passage-editor/text-passage-editor.component';
import { TextPassage, TextPassagesPart } from '../text-passages-part';

@Component({
  selector: 'cadmus-text-passage-editor',
  template: '',
})
class MockTextPassageEditorComponent {
  public readonly citSchemeKey = input<string | undefined | null>();
  public readonly data = model<TextPassage | undefined>();
  public readonly tagEntries = input<unknown>();
  public readonly featureEntries = input<unknown>();
  public readonly cancelEdit = output();
}

describe('TextPassagesPartComponent', () => {
  let component: TextPassagesPartComponent;
  let fixture: ComponentFixture<TextPassagesPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.text-passages',
    partId: 'part1',
    roleId: null,
  };

  function makePassage(citation: string): TextPassage {
    return { citation };
  }

  // the form tags the objects in its arrays with a Symbol: compare plain copies
  function json<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  function setEntries(entries: TextPassage[]): void {
    component.form.entries().value.set(entries);
  }

  function entries(): TextPassage[] {
    return json(component.form.entries().value());
  }

  function makeData(
    passages: TextPassage[],
    thesauri?: ThesauriSet,
  ): EditedObject<TextPassagesPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.text-passages',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        passages,
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
      imports: [TextPassagesPartComponent],
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
      .overrideComponent(TextPassagesPartComponent, {
        remove: { imports: [TextPassageEditorComponent] },
        add: { imports: [MockTextPassageEditorComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TextPassagesPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('form validity', () => {
    it('should be invalid with no passages', () => {
      fixture.detectChanges();
      expect(entries()).toEqual([]);
      expect(component.form().invalid()).toBe(true);
    });

    it('should be valid with at least one passage', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1')]);
      expect(component.form().valid()).toBe(true);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should set tagEntries and featureEntries when thesauri are present', async () => {
      fixture.detectChanges();
      const tagEntries = [{ id: 't1', value: 'T1' }];
      const featureEntries = [{ id: 'f1', value: 'F1' }];

      fixture.componentRef.setInput(
        'data',
        makeData([], {
          'text-passage-tags': { id: 'text-passage-tags', entries: tagEntries },
          'text-passage-features': {
            id: 'text-passage-features',
            entries: featureEntries,
          },
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tagEntries()).toEqual(tagEntries);
      expect(component.featureEntries()).toEqual(featureEntries);
    });

    it('should clear tagEntries and featureEntries when their thesauri are absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([], {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tagEntries()).toBeUndefined();
      expect(component.featureEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1')]);

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(entries()).toEqual([]);
    });

    it('should populate entries from part.passages and mark the form pristine', async () => {
      fixture.detectChanges();
      const passages = [makePassage('If. I 1'), makePassage('If. I 2')];

      fixture.componentRef.setInput('data', makeData(passages));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(entries()).toEqual(passages);
      expect(component.form().dirty()).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the edited part with current entries', async () => {
      fixture.detectChanges();
      const passages = [makePassage('If. I 1')];
      fixture.componentRef.setInput('data', makeData(passages));
      fixture.detectChanges();
      await fixture.whenStable();

      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);
      const value = (component as any).getValue() as TextPassagesPart;

      expect(value.id).toBe('part1');
      expect(json(value.passages)).toEqual([
        makePassage('If. I 1'),
        makePassage('If. I 2'),
      ]);
    });
  });

  describe('addPassage / editPassage / closePassage', () => {
    it('should open the editor for a new passage with a default citation', () => {
      fixture.detectChanges();

      component.addPassage();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toEqual({ citation: '@dc:If. I 1' });
    });

    it('should open the editor for an existing passage as a deep clone', () => {
      fixture.detectChanges();
      const passage = makePassage('If. I 1');

      component.editPassage(passage, 2);

      expect(component.editedIndex()).toBe(2);
      expect(component.edited()).toEqual(passage);
      expect(component.edited()).not.toBe(passage);
    });

    it('should close the editor', () => {
      fixture.detectChanges();
      component.editPassage(makePassage('If. I 1'), 0);

      component.closePassage();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  describe('savePassage', () => {
    it('should append a new passage when editedIndex is -1', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1')]);
      component.addPassage();

      component.savePassage(makePassage('If. I 2'));

      expect(entries()).toEqual([
        makePassage('If. I 1'),
        makePassage('If. I 2'),
      ]);
      expect(component.form.entries().dirty()).toBe(true);
      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });

    it('should replace the passage at editedIndex when editing an existing one', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);
      component.editPassage(makePassage('If. I 2'), 1);

      component.savePassage(makePassage('If. I 2 (edited)'));

      expect(entries()).toEqual([
        makePassage('If. I 1'),
        makePassage('If. I 2 (edited)'),
      ]);
    });
  });

  describe('deletePassage', () => {
    it('should remove the passage when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);

      component.deletePassage(0);

      expect(entries()).toEqual([makePassage('If. I 2')]);
      expect(component.form.entries().dirty()).toBe(true);
    });

    it('should not remove the passage when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      setEntries([makePassage('If. I 1')]);

      component.deletePassage(0);

      expect(entries()).toEqual([makePassage('If. I 1')]);
    });

    it('should close the editor when deleting the currently edited passage', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      setEntries([makePassage('If. I 1')]);
      component.editPassage(makePassage('If. I 1'), 0);

      component.deletePassage(0);

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  describe('movePassageUp', () => {
    it('should do nothing when index is 0', () => {
      fixture.detectChanges();
      const passages = [makePassage('If. I 1'), makePassage('If. I 2')];
      setEntries(passages);

      component.movePassageUp(0);

      expect(entries()).toEqual(passages);
      expect(component.form.entries().dirty()).toBe(false);
    });

    it('should swap the passage with the previous one', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);

      component.movePassageUp(1);

      expect(entries()).toEqual([
        makePassage('If. I 2'),
        makePassage('If. I 1'),
      ]);
    });

    it('should keep editedIndex tracking the moved-up passage', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);
      component.editPassage(makePassage('If. I 2'), 1);

      component.movePassageUp(1);

      expect(component.editedIndex()).toBe(0);
    });

    it('should keep editedIndex tracking the displaced passage', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);
      component.editPassage(makePassage('If. I 1'), 0);

      component.movePassageUp(1);

      expect(component.editedIndex()).toBe(1);
    });
  });

  describe('movePassageDown', () => {
    it('should do nothing when index is the last one', () => {
      fixture.detectChanges();
      const passages = [makePassage('If. I 1'), makePassage('If. I 2')];
      setEntries(passages);

      component.movePassageDown(1);

      expect(entries()).toEqual(passages);
      expect(component.form.entries().dirty()).toBe(false);
    });

    it('should swap the passage with the next one', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);

      component.movePassageDown(0);

      expect(entries()).toEqual([
        makePassage('If. I 2'),
        makePassage('If. I 1'),
      ]);
    });

    it('should keep editedIndex tracking the moved-down passage', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);
      component.editPassage(makePassage('If. I 1'), 0);

      component.movePassageDown(0);

      expect(component.editedIndex()).toBe(1);
    });

    it('should keep editedIndex tracking the displaced passage', () => {
      fixture.detectChanges();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);
      component.editPassage(makePassage('If. I 2'), 1);

      component.movePassageDown(0);

      expect(component.editedIndex()).toBe(0);
    });
  });

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('should leave a newly bound part pristine', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([makePassage('If. I 1')]));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isDirty()).toBe(false);
    });
  });

  describe('save', () => {
    it('should save entries without the form Symbol tags, and become pristine', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([makePassage('If. I 1')]));
      fixture.detectChanges();
      await fixture.whenStable();
      setEntries([makePassage('If. I 1'), makePassage('If. I 2')]);
      component.form.entries().markAsDirty();
      expect(component.isDirty()).toBe(true);

      component.save();

      const saved = (component.data()!.value as TextPassagesPart).passages;
      expect(saved).toEqual([makePassage('If. I 1'), makePassage('If. I 2')]);
      saved.forEach((e) => expect(Object.getOwnPropertySymbols(e)).toEqual([]));
      expect(component.isDirty()).toBe(false);
    });
  });
});
