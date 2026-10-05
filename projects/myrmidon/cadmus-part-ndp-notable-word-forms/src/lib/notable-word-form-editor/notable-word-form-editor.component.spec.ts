import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
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

@Component({
  selector: 'cadmus-refs-asserted-composite-ids',
  template: '',
})
class MockAssertedCompositeIdsComponent {
  public readonly ids = input<AssertedCompositeId[]>();
  public readonly idScopeEntries = input<ThesaurusEntry[]>();
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  public readonly featureEntries = input<ThesaurusEntry[]>();
  public readonly lookupProviderOptions = input<unknown>();
  public readonly idsChange = output<AssertedCompositeId[]>();
}

// the form tags the objects in its arrays with a Symbol: compare plain copies
function json<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
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
        remove: {
          imports: [
            ThesaurusEntriesPickerComponent,
            AssertedCompositeIdsComponent,
          ],
        },
        add: {
          imports: [
            MockThesaurusEntriesPickerComponent,
            MockAssertedCompositeIdsComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotableWordFormEditorComponent);
    component = fixture.componentInstance;
  });

  async function bind(form: NotableWordForm | undefined): Promise<void> {
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('sourceText / targetText', () => {
    it('should be undefined when either value or referenceForm is empty', () => {
      fixture.detectChanges();
      component.formCtl.value().value.set('foo');
      component.formCtl.referenceForm().value.set('');

      expect(component.sourceText()).toBeUndefined();
      expect(component.targetText()).toBeUndefined();
    });

    it('should use value as source and referenceForm as target when isValueTarget is false', () => {
      fixture.detectChanges();
      component.formCtl.value().value.set('foo');
      component.formCtl.referenceForm().value.set('bar');
      component.formCtl.isValueTarget().value.set(false);

      expect(component.sourceText()).toBe('foo');
      expect(component.targetText()).toBe('bar');
    });

    it('should use referenceForm as source and value as target when isValueTarget is true', () => {
      fixture.detectChanges();
      component.formCtl.value().value.set('foo');
      component.formCtl.referenceForm().value.set('bar');
      component.formCtl.isValueTarget().value.set(true);

      expect(component.sourceText()).toBe('bar');
      expect(component.targetText()).toBe('foo');
    });
  });

  describe('binding the form model', () => {
    it('should reset the draft and re-enable value/referenceForm when form is undefined', async () => {
      await bind({ value: 'leftover', operations: ['@1!'] });
      expect(component.formCtl.value().disabled()).toBe(true);

      await bind(undefined);

      expect(component.formCtl.value().value()).toBe('');
      expect(component.formCtl.value().disabled()).toBe(false);
      expect(component.formCtl.referenceForm().disabled()).toBe(false);
    });

    it('should populate all simple fields from the data, pristine', async () => {
      await bind({
        eid: 'w-amare',
        value: 'amare',
        language: 'lat',
        rank: 3,
        note: 'a note',
        referenceForm: 'amāre',
        isValueTarget: true,
      });

      expect(component.formCtl.eid().value()).toBe('w-amare');
      expect(component.formCtl.value().value()).toBe('amare');
      expect(component.formCtl.language().value()).toBe('lat');
      expect(component.formCtl.rank().value()).toBe(3);
      expect(component.formCtl.note().value()).toBe('a note');
      expect(component.formCtl.referenceForm().value()).toBe('amāre');
      expect(component.formCtl.isValueTarget().value()).toBe(true);
      expect(component.formCtl().dirty()).toBe(false);
    });

    it('should default rank to 0 and isValueTarget to false when absent', async () => {
      await bind({ value: 'x' });

      expect(component.formCtl.rank().value()).toBe(0);
      expect(component.formCtl.isValueTarget().value()).toBe(false);
    });

    it('should map tag ids to matching tagEntries, falling back to {id, value: id} for unknown ids', async () => {
      fixture.componentRef.setInput('tagEntries', TAG_ENTRIES);
      await bind({ value: 'x', tags: ['tag-a', 'unknown'] });

      expect(component.tagPickerEntries()).toEqual([
        TAG_ENTRIES[0],
        { id: 'unknown', value: 'unknown' },
      ]);
    });

    it('should map tag ids to {id, value: id} when no tagEntries are provided', async () => {
      await bind({ value: 'x', tags: ['free-tag'] });

      expect(component.tagPickerEntries()).toEqual([
        { id: 'free-tag', value: 'free-tag' },
      ]);
    });

    it('should keep the edits when tagEntries change', async () => {
      await bind({ value: 'x' });
      component.formCtl.value().value.set('edited');

      fixture.componentRef.setInput('tagEntries', TAG_ENTRIES);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.formCtl.value().value()).toBe('edited');
    });

    it('should parse operations and disable value/referenceForm when operations are present', async () => {
      await bind({ value: 'x', operations: ['@1!'] });

      const ops = component.formCtl.operations().value();
      expect(ops.length).toBe(1);
      expect(ops[0].toString()).toBe('@1!');
      expect(component.formCtl.value().disabled()).toBe(true);
      expect(component.formCtl.referenceForm().disabled()).toBe(true);
    });

    it('should keep value/referenceForm enabled when there are no operations', async () => {
      await bind({ value: 'x' });

      expect(component.formCtl.value().disabled()).toBe(false);
      expect(component.formCtl.referenceForm().disabled()).toBe(false);
    });

    it('should set references and links from the data, as copies', async () => {
      const references: DocReference[] = [{ citation: 'If. I 1' }];
      const links: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];

      await bind({ value: 'x', references, links });

      expect(json(component.formCtl.references().value())).toEqual(references);
      expect(json(component.formCtl.links().value())).toEqual(links);
      // the caller's objects are not adopted by the form
      expect(Object.getOwnPropertySymbols(references[0])).toEqual([]);
      expect(Object.getOwnPropertySymbols(links[0])).toEqual([]);
    });
  });

  describe('operations disable/enable', () => {
    it('should disable value/referenceForm when operations change to a non-empty array', () => {
      fixture.detectChanges();

      component.onOperationsChange([EditOperation.parseOperation('@1!')]);

      expect(component.formCtl.value().disabled()).toBe(true);
      expect(component.formCtl.referenceForm().disabled()).toBe(true);
    });

    it('should re-enable value/referenceForm when operations become empty', () => {
      fixture.detectChanges();
      component.onOperationsChange([EditOperation.parseOperation('@1!')]);

      component.onOperationsChange([]);

      expect(component.formCtl.value().disabled()).toBe(false);
      expect(component.formCtl.referenceForm().disabled()).toBe(false);
    });
  });

  describe('onXxxChange handlers', () => {
    it('onTagEntriesChange should update tags and mark dirty', () => {
      fixture.detectChanges();
      component.onTagEntriesChange([TAG_ENTRIES[0]]);
      expect(component.formCtl.tags().value()).toEqual(['tag-a']);
      expect(component.formCtl.tags().dirty()).toBe(true);
    });

    it('onOperationsChange should update operations and mark dirty', () => {
      fixture.detectChanges();
      const op = EditOperation.parseOperation('@1!');
      component.onOperationsChange([op]);
      expect(component.formCtl.operations().value()[0]).toBe(op);
      expect(component.formCtl.operations().dirty()).toBe(true);
    });

    it('onReferencesChange should update references and mark dirty', () => {
      fixture.detectChanges();
      const refs: DocReference[] = [{ citation: 'If. I 1' }];
      component.onReferencesChange(refs);
      expect(json(component.formCtl.references().value())).toEqual(refs);
      expect(component.formCtl.references().dirty()).toBe(true);
    });

    it('onLinksChange should update links and mark dirty', () => {
      fixture.detectChanges();
      const links: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onLinksChange(links);
      expect(json(component.formCtl.links().value())).toEqual(links);
      expect(component.formCtl.links().dirty()).toBe(true);
    });

    it('should stay pristine when a child echoes back a normalized copy of its value', async () => {
      await bind({
        value: 'x',
        references: [{ citation: 'If. I 1', tag: null as unknown as string }],
      });

      // e.g. the child drops the null tag
      component.onReferencesChange([{ citation: 'If. I 1' }]);
      component.onLinksChange([]);
      component.onTagEntriesChange([]);

      expect(component.formCtl().dirty()).toBe(false);
    });
  });

  describe('save', () => {
    it('should touch all fields and not update the model when invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.form()).toBeUndefined();
      expect(component.formCtl.value().touched()).toBe(true);
    });

    it('should build and set trimmed, minimal data when valid', () => {
      fixture.detectChanges();
      component.formCtl.value().value.set('  amare  ');
      component.formCtl.note().value.set('  a note  ');
      component.formCtl.referenceForm().value.set('  amāre  ');

      component.save();

      expect(component.form()).toEqual({
        eid: undefined,
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

    it('should keep the bound eid when saving', async () => {
      await bind({ eid: 'w-amare', value: 'amare' });
      component.formCtl.note().value.set('edited');

      component.save();

      expect(component.form()?.eid).toBe('w-amare');
    });

    it('should save a trimmed eid', () => {
      fixture.detectChanges();
      component.formCtl.eid().value.set('  w-amare  ');
      component.formCtl.value().value.set('amare');

      component.save();

      expect(component.form()?.eid).toBe('w-amare');
    });

    it('should include tags, operations, isValueTarget, references and links when set', () => {
      fixture.detectChanges();
      component.formCtl.value().value.set('amare');
      component.onTagEntriesChange([TAG_ENTRIES[0]]);
      component.formCtl.isValueTarget().value.set(true);
      const refs: DocReference[] = [{ citation: 'If. I 1' }];
      const links: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onReferencesChange(refs);
      component.onLinksChange(links);
      component.onOperationsChange([EditOperation.parseOperation('@1!')]);

      component.save();

      const saved = component.form();
      expect(saved?.tags).toEqual(['tag-a']);
      expect(saved?.isValueTarget).toBe(true);
      expect(saved?.references).toEqual(refs);
      expect(saved?.links).toEqual(links);
      expect(saved?.operations).toEqual(['@1!']);
      // no Symbol tags leak into the saved model
      expect(Object.getOwnPropertySymbols(saved!.references![0])).toEqual([]);
      expect(Object.getOwnPropertySymbols(saved!.links![0])).toEqual([]);
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.formCtl.value().value.set('amare');
      component.formCtl.value().markAsDirty();

      component.save();

      expect(component.formCtl().dirty()).toBe(false);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.formCtl.value().value.set('amare');
      component.formCtl.value().markAsDirty();

      component.save(false);

      expect(component.formCtl().dirty()).toBe(true);
      expect(component.form()).toBeTruthy();
    });
  });

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('should save on Enter in a text input when valid and dirty', async () => {
      await bind({ value: 'amare' });
      component.formCtl.value().value.set('videre');
      component.formCtl.value().markAsDirty();
      fixture.detectChanges();

      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );

      expect(component.form()?.value).toBe('videre');
    });

    it('should not save on Enter when pristine', async () => {
      await bind({ value: 'amare' });
      const spy = vi.spyOn(component, 'save');

      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input');
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('thesauri', () => {
    it('should pass the pin-link thesauri to the links editor', async () => {
      const entries = (id: string): ThesaurusEntry[] => [{ id, value: id }];
      fixture.componentRef.setInput('refTypeEntries', entries('doc-type'));
      fixture.componentRef.setInput('refTagEntries', entries('doc-tag'));
      fixture.componentRef.setInput('linkScopeEntries', entries('scope'));
      fixture.componentRef.setInput('linkTagEntries', entries('link-tag'));
      fixture.componentRef.setInput('linkAssTagEntries', entries('ass-tag'));
      fixture.componentRef.setInput(
        'linkDocRefTypeEntries',
        entries('link-doc-type'),
      );
      fixture.componentRef.setInput(
        'linkDocRefTagEntries',
        entries('link-doc-tag'),
      );
      fixture.componentRef.setInput('idFeatureEntries', entries('feature'));
      await bind({ value: 'amare' });
      // the links editor is in the References tab
      const tabs: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('[role="tab"]'),
      );
      tabs.find((t) => t.textContent?.includes('References'))!.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const links = fixture.debugElement.query(
        By.directive(MockAssertedCompositeIdsComponent),
      ).componentInstance as MockAssertedCompositeIdsComponent;
      expect(links.idScopeEntries()).toEqual(entries('scope'));
      expect(links.idTagEntries()).toEqual(entries('link-tag'));
      expect(links.assTagEntries()).toEqual(entries('ass-tag'));
      expect(links.refTypeEntries()).toEqual(entries('link-doc-type'));
      expect(links.refTagEntries()).toEqual(entries('link-doc-tag'));
      expect(links.featureEntries()).toEqual(entries('feature'));
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
