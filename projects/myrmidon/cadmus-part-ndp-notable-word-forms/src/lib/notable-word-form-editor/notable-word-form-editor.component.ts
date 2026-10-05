import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import {
  disabled,
  form,
  FormField,
  maxLength,
  min,
  required,
} from '@angular/forms/signals';

import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';

import {
  LookupDocReferencesComponent,
  LookupProviderOptions,
} from '@myrmidon/cadmus-refs-lookup';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { DocReference } from '@myrmidon/cadmus-refs-doc-references';
import {
  EditOperation,
  EditOperationSetComponent,
} from '@myrmidon/cadmus-part-philology-ui';
import { ThesaurusEntriesPickerComponent } from '@myrmidon/cadmus-thesaurus-store';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { NotableWordForm } from '../notable-word-forms-part';

/**
 * The editable draft behind the form.
 */
interface NotableWordFormControls {
  eid: string;
  value: string;
  language: string;
  rank: number | null;
  // tag IDs: the picker's entries are derived from them
  tags: string[];
  note: string;
  referenceForm: string;
  // class instances: they are not deep-copied
  operations: EditOperation[];
  isValueTarget: boolean;
  references: DocReference[];
  links: AssertedCompositeId[];
}

/**
 * Notable word form -> draft.
 */
function toDraft(form?: NotableWordForm | null): NotableWordFormControls {
  return {
    eid: form?.eid || '',
    value: form?.value || '',
    language: form?.language || '',
    rank: form?.rank || 0,
    tags: [...(form?.tags || [])],
    note: form?.note || '',
    referenceForm: form?.referenceForm || '',
    operations:
      form?.operations?.map((s) => EditOperation.parseOperation(s)) || [],
    isValueTarget: form?.isValueTarget || false,
    references: copyFormValue(form?.references || []),
    links: copyFormValue(form?.links || []),
  };
}

/**
 * Draft -> notable word form.
 */
function toModel(draft: NotableWordFormControls): NotableWordForm {
  return {
    eid: draft.eid.trim() || undefined,
    value: draft.value.trim(),
    language: draft.language.trim() || undefined,
    rank: draft.rank || undefined,
    tags: draft.tags.length ? [...draft.tags] : undefined,
    note: draft.note.trim() || undefined,
    referenceForm: draft.referenceForm.trim() || undefined,
    operations: draft.operations.length
      ? draft.operations.map((op) => op.toString())
      : undefined,
    isValueTarget: draft.isValueTarget ? true : undefined,
    references: draft.references.length
      ? copyFormValue(draft.references)
      : undefined,
    links: draft.links.length ? copyFormValue(draft.links) : undefined,
  };
}

/**
 * Notable word form editor. This is a manual-save editor: the edited
 * form is emitted only when the user saves it.
 */
@Component({
  selector: 'cadmus-notable-word-form-editor',
  imports: [
    FormField,
    MatCheckbox,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatTabGroup,
    MatTab,
    MatTooltip,
    ThesaurusEntriesPickerComponent,
    EditOperationSetComponent,
    LookupDocReferencesComponent,
    AssertedCompositeIdsComponent,
  ],
  templateUrl: './notable-word-form-editor.component.html',
  styleUrl: './notable-word-form-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotableWordFormEditorComponent {
  /**
   * The notable word form being edited.
   */
  public readonly form = model<NotableWordForm | undefined>();
  public readonly cancelEdit = output();

  // notable-word-forms-languages
  public readonly langEntries = input<ThesaurusEntry[] | undefined>();
  // notable-word-forms-tags
  public readonly tagEntries = input<ThesaurusEntry[] | undefined>();
  // notable-word-forms-op-tags
  public readonly opTagEntries = input<ThesaurusEntry[] | undefined>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[] | undefined>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[] | undefined>();
  // pin-link-scopes
  public readonly linkScopeEntries = input<ThesaurusEntry[] | undefined>();
  // pin-link-tags
  public readonly linkTagEntries = input<ThesaurusEntry[] | undefined>();
  // pin-link-assertion-tags
  public readonly linkAssTagEntries = input<ThesaurusEntry[] | undefined>();
  // pin-link-docref-types
  public readonly linkDocRefTypeEntries = input<ThesaurusEntry[] | undefined>();
  // pin-link-docref-tags
  public readonly linkDocRefTagEntries = input<ThesaurusEntry[] | undefined>();
  // asserted-id-features
  public readonly idFeatureEntries = input<ThesaurusEntry[] | undefined>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  // the draft is rebuilt from each new bound form
  private readonly _draft = linkedSignal(() => toDraft(this.form()));

  /**
   * The editor's form (named so because `form` is the edited model).
   */
  public readonly formCtl = form(this._draft, (p) => {
    maxLength(p.eid, 100);
    required(p.value);
    maxLength(p.value, 500);
    maxLength(p.language, 50);
    min(p.rank, 0);
    maxLength(p.note, 2000);
    maxLength(p.referenceForm, 500);
    // value and reference form are fixed once there are operations
    disabled(p.value, {
      when: ({ valueOf }) => valueOf(p.operations).length > 0,
    });
    disabled(p.referenceForm, {
      when: ({ valueOf }) => valueOf(p.operations).length > 0,
    });
  });

  /**
   * The picked tag entries, from the draft's tag IDs.
   */
  public readonly tagPickerEntries = computed<ThesaurusEntry[]>(() => {
    const entries = this.tagEntries();
    return this.formCtl
      .tags()
      .value()
      .map((id) => entries?.find((e) => e.id === id) || { id, value: id });
  });

  /**
   * The source text for transformation via operations.
   * This is referenceForm when isValueTarget is true (ref → value), or
   * value when isValueTarget is false (value → ref).
   */
  public readonly sourceText = computed<string | undefined>(() => {
    const refForm = this.formCtl.referenceForm().value();
    const val = this.formCtl.value().value();
    if (!refForm || !val) return undefined;
    return this.formCtl.isValueTarget().value() ? refForm : val;
  });

  /**
   * The target text for transformation via operations.
   * This is value when isValueTarget is true (ref → value), or
   * referenceForm when isValueTarget is false (value → ref).
   */
  public readonly targetText = computed<string | undefined>(() => {
    const refForm = this.formCtl.referenceForm().value();
    const val = this.formCtl.value().value();
    if (!refForm || !val) return undefined;
    return this.formCtl.isValueTarget().value() ? val : refForm;
  });

  constructor() {
    // when the draft mirrors the bound form, there are no unsaved edits
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.formCtl().reset();
        }
      });
    });
  }

  /** True when the draft still mirrors the bound form. */
  private isDraftInSync(draft: NotableWordFormControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.form()));
  }

  public onTagEntriesChange(entries: ThesaurusEntry[]): void {
    setFieldFromChild(
      this.formCtl.tags,
      (entries || []).map((e) => e.id),
    );
  }

  public onOperationsChange(operations: EditOperation[]): void {
    setFieldFromChild(this.formCtl.operations, operations || []);
  }

  public onReferencesChange(references: DocReference[]): void {
    setFieldFromChild(this.formCtl.references, copyFormValue(references || []));
  }

  public onLinksChange(links: AssertedCompositeId[]): void {
    setFieldFromChild(this.formCtl.links, copyFormValue(links || []));
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Handle Enter: in a text input, save as the save button would, when it
   * is enabled. This replaces the implicit submission of a form, which
   * targeted only the innermost form.
   * @param event The keydown event.
   */
  public onEnterKey(event: Event): void {
    if (!isImplicitSubmission(event)) {
      return;
    }
    // consume Enter even when not saving, so that it does not reach an
    // enclosing editor, which would save itself instead
    event.preventDefault();
    if (this.formCtl().valid() && this.formCtl().dirty()) {
      this.save();
    }
  }

  /**
   * Save the draft into the `form` model signal.
   * @param pristine If true (default), the form's interaction state is
   * cleared after saving.
   */
  public save(pristine = true): void {
    if (this.formCtl().invalid()) {
      // show validation errors
      this.formCtl().markAsTouched();
      return;
    }
    this.form.set(toModel(this._draft()));
    if (pristine) {
      this.formCtl().reset();
    }
  }
}
