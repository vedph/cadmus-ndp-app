import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { NotableWordFormsPartComponent } from './notable-word-forms-part.component';
import { NotableWordFormEditorComponent } from '../notable-word-form-editor/notable-word-form-editor.component';
import {
  NotableWordForm,
  NotableWordFormsPart,
} from '../notable-word-forms-part';

@Component({
  selector: 'cadmus-notable-word-form-editor',
  template: '',
})
class MockNotableWordFormEditorComponent {
  public readonly tagEntries = input<unknown>();
  public readonly langEntries = input<unknown>();
  public readonly form = model<NotableWordForm | undefined>();
}

describe('NotableWordFormsPartComponent', () => {
  let component: NotableWordFormsPartComponent;
  let fixture: ComponentFixture<NotableWordFormsPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.notable-word-forms',
    partId: 'part1',
    roleId: null,
  };

  function makeForm(value: string): NotableWordForm {
    return { value };
  }

  function makeData(
    forms: NotableWordForm[],
    thesauri?: ThesauriSet,
  ): EditedObject<NotableWordFormsPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.notable-word-forms',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        forms,
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
      imports: [NotableWordFormsPartComponent],
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
      .overrideComponent(NotableWordFormsPartComponent, {
        remove: { imports: [NotableWordFormEditorComponent] },
        add: { imports: [MockNotableWordFormEditorComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotableWordFormsPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('buildForm / validity', () => {
    it('should be invalid with no forms', () => {
      fixture.detectChanges();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with at least one form', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare')]);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should set every entries signal when its thesaurus is present', async () => {
      fixture.detectChanges();
      const thesauri: ThesauriSet = {
        'notable-word-forms-languages': {
          id: 'notable-word-forms-languages',
          entries: [{ id: 'lat', value: 'Latin' }],
        },
        'notable-word-forms-tags': {
          id: 'notable-word-forms-tags',
          entries: [{ id: 't1', value: 'T1' }],
        },
        'notable-word-forms-op-tags': {
          id: 'notable-word-forms-op-tags',
          entries: [{ id: 'ot1', value: 'OT1' }],
        },
        'doc-reference-types': {
          id: 'doc-reference-types',
          entries: [{ id: 'rt1', value: 'RT1' }],
        },
        'doc-reference-tags': {
          id: 'doc-reference-tags',
          entries: [{ id: 'rtag1', value: 'RTag1' }],
        },
        'pin-link-scopes': {
          id: 'pin-link-scopes',
          entries: [{ id: 'sc1', value: 'Sc1' }],
        },
        'pin-link-tags': {
          id: 'pin-link-tags',
          entries: [{ id: 'plt1', value: 'PLT1' }],
        },
        'pin-link-assertion-tags': {
          id: 'pin-link-assertion-tags',
          entries: [{ id: 'pat1', value: 'PAT1' }],
        },
        'pin-link-docref-types': {
          id: 'pin-link-docref-types',
          entries: [{ id: 'pdt1', value: 'PDT1' }],
        },
        'pin-link-docref-tags': {
          id: 'pin-link-docref-tags',
          entries: [{ id: 'pdtag1', value: 'PDTag1' }],
        },
        'asserted-id-features': {
          id: 'asserted-id-features',
          entries: [{ id: 'f1', value: 'F1' }],
        },
      };

      fixture.componentRef.setInput('data', makeData([], thesauri));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.langEntries()).toEqual(
        thesauri['notable-word-forms-languages'].entries,
      );
      expect(component.tagEntries()).toEqual(
        thesauri['notable-word-forms-tags'].entries,
      );
      expect(component.opTagEntries()).toEqual(
        thesauri['notable-word-forms-op-tags'].entries,
      );
      expect(component.docRefTypeEntries()).toEqual(
        thesauri['doc-reference-types'].entries,
      );
      expect(component.docRefTagEntries()).toEqual(
        thesauri['doc-reference-tags'].entries,
      );
      expect(component.pinLinkScopeEntries()).toEqual(
        thesauri['pin-link-scopes'].entries,
      );
      expect(component.pinLinkTagEntries()).toEqual(
        thesauri['pin-link-tags'].entries,
      );
      expect(component.pinLinkAssertionTagEntries()).toEqual(
        thesauri['pin-link-assertion-tags'].entries,
      );
      expect(component.pinLinkDocRefTypeEntries()).toEqual(
        thesauri['pin-link-docref-types'].entries,
      );
      expect(component.pinLinkDocRefTagEntries()).toEqual(
        thesauri['pin-link-docref-tags'].entries,
      );
      expect(component.idFeatureEntries()).toEqual(
        thesauri['asserted-id-features'].entries,
      );
    });

    it('should clear every entries signal when thesauri are absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([], {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.langEntries()).toBeUndefined();
      expect(component.tagEntries()).toBeUndefined();
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
        'it.vedph.ndp.notable-word-forms',
        undefined,
      );
      expect(component.lookupProviderOptions()).toEqual(options);
    });

    it('should clear lookupProviderOptions when settings have none', async () => {
      appRepository.getSettingFor.mockResolvedValue(undefined);
      fixture.detectChanges();

      fixture.componentRef.setInput('data', makeData([]));
      fixture.detectChanges();
      await fixture.whenStable();
      await Promise.resolve();

      expect(component.lookupProviderOptions()).toBeUndefined();
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare')]);

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.entries.value).toEqual([]);
    });

    it('should populate entries from part.forms and mark the form pristine', async () => {
      fixture.detectChanges();
      const forms = [makeForm('amare'), makeForm('videre')];

      fixture.componentRef.setInput('data', makeData(forms));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.entries.value).toEqual(forms);
      expect(component.form.pristine).toBe(true);
    });
  });

  describe('getValue', () => {
    it('should return the edited part with current entries', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([makeForm('amare')]));
      fixture.detectChanges();
      await fixture.whenStable();

      component.entries.setValue([makeForm('amare'), makeForm('videre')]);
      const value = (component as any).getValue() as NotableWordFormsPart;

      expect(value.id).toBe('part1');
      expect(value.forms).toEqual([makeForm('amare'), makeForm('videre')]);
    });
  });

  describe('addForm / editForm / closeForm', () => {
    it('should open the editor for a new empty form', () => {
      fixture.detectChanges();

      component.addForm();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toEqual({ value: '' });
    });

    it('should open the editor for an existing form as a deep clone', () => {
      fixture.detectChanges();
      const entry = makeForm('amare');

      component.editForm(entry, 2);

      expect(component.editedIndex()).toBe(2);
      expect(component.edited()).toEqual(entry);
      expect(component.edited()).not.toBe(entry);
    });

    it('should close the editor', () => {
      fixture.detectChanges();
      component.editForm(makeForm('amare'), 0);

      component.closeForm();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  describe('saveForm', () => {
    it('should append a new form when editedIndex is -1', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare')]);
      component.addForm();

      component.saveForm(makeForm('videre'));

      expect(component.entries.value).toEqual([
        makeForm('amare'),
        makeForm('videre'),
      ]);
      expect(component.entries.dirty).toBe(true);
      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });

    it('should replace the form at editedIndex when editing an existing one', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);
      component.editForm(makeForm('videre'), 1);

      component.saveForm(makeForm('videre (edited)'));

      expect(component.entries.value).toEqual([
        makeForm('amare'),
        makeForm('videre (edited)'),
      ]);
    });
  });

  describe('deleteForm', () => {
    it('should remove the form when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);

      component.deleteForm(0);

      expect(component.entries.value).toEqual([makeForm('videre')]);
      expect(component.entries.dirty).toBe(true);
    });

    it('should not remove the form when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      component.entries.setValue([makeForm('amare')]);

      component.deleteForm(0);

      expect(component.entries.value).toEqual([makeForm('amare')]);
    });

    it('should close the editor when deleting the currently edited form', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.entries.setValue([makeForm('amare')]);
      component.editForm(makeForm('amare'), 0);

      component.deleteForm(0);

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  // moveFormUp/moveFormDown: regression tests for a bug where editedIndex
  // was not kept in sync with the entries array after a move, which made
  // saveForm() overwrite the wrong entry after reordering.
  describe('moveFormUp', () => {
    it('should do nothing when index is 0', () => {
      fixture.detectChanges();
      const forms = [makeForm('amare'), makeForm('videre')];
      component.entries.setValue(forms);

      component.moveFormUp(0);

      expect(component.entries.value).toEqual(forms);
      expect(component.entries.dirty).toBe(false);
    });

    it('should swap the form with the previous one', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);

      component.moveFormUp(1);

      expect(component.entries.value).toEqual([
        makeForm('videre'),
        makeForm('amare'),
      ]);
    });

    it('should keep editedIndex tracking the moved-up form', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);
      component.editForm(makeForm('videre'), 1);

      component.moveFormUp(1);

      expect(component.editedIndex()).toBe(0);
    });

    it('should keep editedIndex tracking the displaced form', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);
      component.editForm(makeForm('amare'), 0);

      component.moveFormUp(1);

      expect(component.editedIndex()).toBe(1);
    });
  });

  describe('moveFormDown', () => {
    it('should do nothing when index is the last one', () => {
      fixture.detectChanges();
      const forms = [makeForm('amare'), makeForm('videre')];
      component.entries.setValue(forms);

      component.moveFormDown(1);

      expect(component.entries.value).toEqual(forms);
      expect(component.entries.dirty).toBe(false);
    });

    it('should swap the form with the next one', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);

      component.moveFormDown(0);

      expect(component.entries.value).toEqual([
        makeForm('videre'),
        makeForm('amare'),
      ]);
    });

    it('should keep editedIndex tracking the moved-down form', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);
      component.editForm(makeForm('amare'), 0);

      component.moveFormDown(0);

      expect(component.editedIndex()).toBe(1);
    });

    it('should keep editedIndex tracking the displaced form', () => {
      fixture.detectChanges();
      component.entries.setValue([makeForm('amare'), makeForm('videre')]);
      component.editForm(makeForm('videre'), 1);

      component.moveFormDown(0);

      expect(component.editedIndex()).toBe(0);
    });
  });
});
