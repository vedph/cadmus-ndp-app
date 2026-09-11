import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import { EditOperation } from '@myrmidon/cadmus-part-philology-ui';
import { ThesaurusEntriesPickerComponent } from '@myrmidon/cadmus-thesaurus-store';

import { NotableWordFormEditorComponent } from './notable-word-form-editor.component';
import { NotableWordForm } from '../notable-word-forms-part';

@Component({
  selector: 'cadmus-thesaurus-entries-picker',
  template: '',
})
class MockThesaurusEntriesPickerComponent {
  public readonly availableEntries = input<ThesaurusEntry[]>();
  public readonly entries = input<ThesaurusEntry[]>();
  public readonly entriesChange = output<ThesaurusEntry[]>();
}

describe('NotableWordFormEditorComponent', () => {
  let component: NotableWordFormEditorComponent;
  let fixture: ComponentFixture<NotableWordFormEditorComponent>;

  const TAG_ENTRIES: ThesaurusEntry[] = [
    { id: 'tag-a', value: 'Tag A' },
    { id: 'tag-b', value: 'Tag B' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotableWordFormEditorComponent],
      providers: [provideNoopAnimations()],
    })
      .overrideComponent(NotableWordFormEditorComponent, {
        remove: { imports: [ThesaurusEntriesPickerComponent] },
        add: { imports: [MockThesaurusEntriesPickerComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotableWordFormEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('sourceText / targetText', () => {
    it('should be undefined when either value or referenceForm is empty', () => {
      fixture.detectChanges();
      component.value.setValue('foo');
      component.referenceForm.setValue(null);

      expect(component.sourceText()).toBeUndefined();
      expect(component.targetText()).toBeUndefined();
    });

    it('should use value as source and referenceForm as target when isValueTarget is false', () => {
      fixture.detectChanges();
      component.value.setValue('foo');
      component.referenceForm.setValue('bar');
      component.isValueTarget.setValue(false);

      expect(component.sourceText()).toBe('foo');
      expect(component.targetText()).toBe('bar');
    });

    it('should use referenceForm as source and value as target when isValueTarget is true', () => {
      fixture.detectChanges();
      component.value.setValue('foo');
      component.referenceForm.setValue('bar');
      component.isValueTarget.setValue(true);

      expect(component.sourceText()).toBe('bar');
      expect(component.targetText()).toBe('foo');
    });
  });

  describe('updateForm (via form model effect)', () => {
    it('should reset the form and re-enable value/referenceForm when form is undefined', () => {
      fixture.componentRef.setInput('form', {
        value: 'leftover',
      } as NotableWordForm);
      fixture.detectChanges();
      component.value.disable();

      fixture.componentRef.setInput('form', undefined);
      fixture.detectChanges();

      expect(component.value.value).toBe('');
      expect(component.value.disabled).toBe(false);
      expect(component.referenceForm.disabled).toBe(false);
    });

    it('should populate all simple controls from the data', () => {
      const data: NotableWordForm = {
        value: 'amare',
        language: 'lat',
        rank: 3,
        note: 'a note',
        referenceForm: 'amāre',
        isValueTarget: true,
      };

      fixture.componentRef.setInput('form', data);
      fixture.detectChanges();

      expect(component.value.value).toBe('amare');
      expect(component.language.value).toBe('lat');
      expect(component.rank.value).toBe(3);
      expect(component.note.value).toBe('a note');
      expect(component.referenceForm.value).toBe('amāre');
      expect(component.isValueTarget.value).toBe(true);
      expect(component.formCtl.pristine).toBe(true);
    });

    it('should default rank to 0 and isValueTarget to false when absent', () => {
      fixture.componentRef.setInput('form', { value: 'x' } as NotableWordForm);
      fixture.detectChanges();

      expect(component.rank.value).toBe(0);
      expect(component.isValueTarget.value).toBe(false);
    });

    it('should map tag ids to matching tagEntries, falling back to {id, value: id} for unknown ids', () => {
      fixture.componentRef.setInput('tagEntries', TAG_ENTRIES);
      fixture.componentRef.setInput('form', {
        value: 'x',
        tags: ['tag-a', 'unknown'],
      } as NotableWordForm);
      fixture.detectChanges();

      expect(component.tags.value).toEqual([
        TAG_ENTRIES[0],
        { id: 'unknown', value: 'unknown' },
      ]);
    });

    it('should map tag ids to {id, value: id} when no tagEntries are provided', () => {
      fixture.componentRef.setInput('form', {
        value: 'x',
        tags: ['free-tag'],
      } as NotableWordForm);
      fixture.detectChanges();

      expect(component.tags.value).toEqual([
        { id: 'free-tag', value: 'free-tag' },
      ]);
    });

    it('should parse operations and disable value/referenceForm when operations are present', () => {
      fixture.componentRef.setInput('form', {
        value: 'x',
        operations: ['@1!'],
      } as NotableWordForm);
      fixture.detectChanges();

      expect(component.operations.value.length).toBe(1);
      expect(component.operations.value[0].toString()).toBe('@1!');
      expect(component.value.disabled).toBe(true);
      expect(component.referenceForm.disabled).toBe(true);
    });

    it('should keep value/referenceForm enabled when there are no operations', () => {
      fixture.componentRef.setInput('form', {
        value: 'x',
      } as NotableWordForm);
      fixture.detectChanges();

      expect(component.value.disabled).toBe(false);
      expect(component.referenceForm.disabled).toBe(false);
    });

    it('should set references and links from the data', () => {
      const references: DocReference[] = [{ citation: 'If. I 1' }];
      const links: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];

      fixture.componentRef.setInput('form', {
        value: 'x',
        references,
        links,
      } as NotableWordForm);
      fixture.detectChanges();

      expect(component.references.value).toEqual(references);
      expect(component.links.value).toEqual(links);
    });
  });

  describe('operations disable/enable effect', () => {
    it('should disable value/referenceForm when operations change to a non-empty array', () => {
      fixture.detectChanges();

      component.onOperationsChange([
        EditOperation.parseOperation('@1!'),
      ]);
      fixture.detectChanges();

      expect(component.value.disabled).toBe(true);
      expect(component.referenceForm.disabled).toBe(true);
    });

    it('should re-enable value/referenceForm when operations become empty', () => {
      fixture.detectChanges();
      component.onOperationsChange([EditOperation.parseOperation('@1!')]);
      fixture.detectChanges();

      component.onOperationsChange([]);
      fixture.detectChanges();

      expect(component.value.disabled).toBe(false);
      expect(component.referenceForm.disabled).toBe(false);
    });
  });

  describe('onXxxChange handlers', () => {
    it('onTagEntriesChange should update tags and mark dirty', () => {
      fixture.detectChanges();
      component.onTagEntriesChange([TAG_ENTRIES[0]]);
      expect(component.tags.value).toEqual([TAG_ENTRIES[0]]);
      expect(component.tags.dirty).toBe(true);
    });

    it('onOperationsChange should update operations and mark dirty', () => {
      fixture.detectChanges();
      const op = EditOperation.parseOperation('@1!');
      component.onOperationsChange([op]);
      expect(component.operations.value).toEqual([op]);
      expect(component.operations.dirty).toBe(true);
    });

    it('onReferencesChange should update references and mark dirty', () => {
      fixture.detectChanges();
      const refs: DocReference[] = [{ citation: 'If. I 1' }];
      component.onReferencesChange(refs);
      expect(component.references.value).toEqual(refs);
      expect(component.references.dirty).toBe(true);
    });

    it('onLinksChange should update links and mark dirty', () => {
      fixture.detectChanges();
      const links: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onLinksChange(links);
      expect(component.links.value).toEqual(links);
      expect(component.links.dirty).toBe(true);
    });
  });

  describe('save', () => {
    it('should touch all controls and not update the model when invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.form()).toBeUndefined();
      expect(component.value.touched).toBe(true);
    });

    it('should build and set trimmed, minimal data when valid', () => {
      fixture.detectChanges();
      component.value.setValue('  amare  ');
      component.note.setValue('  a note  ');
      component.referenceForm.setValue('  amāre  ');

      component.save();

      expect(component.form()).toEqual({
        value: 'amare',
        language: undefined,
        rank: undefined,
        tags: undefined,
        note: 'a note',
        referenceForm: 'amāre',
        operations: undefined,
        isValueTarget: undefined,
        references: undefined,
        links: undefined,
      });
    });

    it('should include tags, operations, isValueTarget, references and links when set', () => {
      fixture.detectChanges();
      component.value.setValue('amare');
      component.onTagEntriesChange([TAG_ENTRIES[0]]);
      component.isValueTarget.setValue(true);
      const refs: DocReference[] = [{ citation: 'If. I 1' }];
      const links: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onReferencesChange(refs);
      component.onLinksChange(links);
      // set operations last, since it disables/enables value; value is
      // already set above so this is safe
      component.onOperationsChange([EditOperation.parseOperation('@1!')]);

      component.save();

      const saved = component.form();
      expect(saved?.tags).toEqual(['tag-a']);
      expect(saved?.isValueTarget).toBe(true);
      expect(saved?.references).toEqual(refs);
      expect(saved?.links).toEqual(links);
      expect(saved?.operations).toEqual(['@1!']);
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.value.setValue('amare');

      component.save();

      expect(component.formCtl.pristine).toBe(true);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.value.setValue('amare');
      component.value.markAsDirty();

      component.save(false);

      expect(component.formCtl.pristine).toBe(false);
      expect(component.form()).toBeTruthy();
    });
  });

  describe('cancel', () => {
    it('should emit cancelEdit', () => {
      fixture.detectChanges();
      const spy = vi.fn();
      component.cancelEdit.subscribe(spy);

      component.cancel();

      expect(spy).toHaveBeenCalled();
    });
  });
});
