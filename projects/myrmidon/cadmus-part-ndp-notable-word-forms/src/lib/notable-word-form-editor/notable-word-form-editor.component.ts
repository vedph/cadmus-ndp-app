import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';

import { LookupDocReferencesComponent, LookupDocReferenceComponent } from '@myrmidon/cadmus-refs-lookup';
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
import { ThesEntriesPickerComponent } from '@myrmidon/cadmus-ui';

import { NotableWordForm } from '../notable-word-forms-part';

@Component({
  selector: 'cadmus-notable-word-form-editor',
  imports: [
    ReactiveFormsModule,
    MatCheckbox,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatLabel,
    MatOption,
    MatSelect,
    MatTabGroup,
    MatTab,
    MatTooltip,
    ThesEntriesPickerComponent,
    EditOperationSetComponent,
    LookupDocReferencesComponent,
    AssertedCompositeIdsComponent,
    LookupDocReferenceComponent
],
  templateUrl: './notable-word-form-editor.component.html',
  styleUrl: './notable-word-form-editor.component.css',
})
export class NotableWordFormEditorComponent {
  public readonly form = model<NotableWordForm | undefined>();
  public readonly cancelEdit = output();

  /**
   * The source text for transformation via operations.
   * This is referenceForm or value when isValueTarget is true, or
   * undefined any of them is undefined.
   */
  public readonly sourceText = computed<string | undefined>(() => {
    if (!this.isValueTarget.value || !this.value.value) return undefined;
    return this.isValueTarget.value
      ? this.referenceForm.value || this.value.value
      : undefined;
  });

  /**
   * The target text for transformation via operations.
   * This is value when isValueTarget is true, or referenceForm or
   * value when isValueTarget is false, or undefined any of them is
   * undefined.
   */
  public readonly targetText = computed<string | undefined>(() => {
    if (!this.isValueTarget.value || !this.value.value) return undefined;
    return this.isValueTarget.value
      ? this.value.value
      : this.referenceForm.value || this.value.value;
  });

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

  public value: FormControl<string>;
  public language: FormControl<string | null>;
  public rank: FormControl<number>;
  public tags: FormControl<ThesaurusEntry[]>;
  public note: FormControl<string | null>;
  public referenceForm: FormControl<string | null>;
  public operations: FormControl<EditOperation[]>;
  public isValueTarget: FormControl<boolean>;
  public references: FormControl<DocReference[]>;
  public links: FormControl<AssertedCompositeId[]>;
  public formCtl: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.value = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(500)],
      nonNullable: true,
    });
    this.language = formBuilder.control(null, Validators.maxLength(50));
    this.rank = formBuilder.control(0, { nonNullable: true });
    this.tags = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(2000));
    this.referenceForm = formBuilder.control(null, Validators.maxLength(500));
    this.operations = formBuilder.control([], { nonNullable: true });
    this.isValueTarget = formBuilder.control(false, { nonNullable: true });
    this.references = formBuilder.control([], { nonNullable: true });
    this.links = formBuilder.control([], { nonNullable: true });

    this.formCtl = formBuilder.group({
      value: this.value,
      language: this.language,
      rank: this.rank,
      tags: this.tags,
      note: this.note,
      referenceForm: this.referenceForm,
      operations: this.operations,
      isValueTarget: this.isValueTarget,
      references: this.references,
      links: this.links,
    });

    // when model changes, update form
    effect(() => {
      const form = this.form();
      this.updateForm(form);
    });
  }

  private mapIdsToEntries(
    ids: string[],
    entries: ThesaurusEntry[] | undefined
  ): ThesaurusEntry[] {
    if (!entries) return ids.map((id) => ({ id, value: id }));
    return ids.map(
      (id) => entries.find((e) => e.id === id) || { id, value: id }
    );
  }

  private updateForm(form: NotableWordForm | undefined | null): void {
    if (!form) {
      this.formCtl.reset();
    } else {
      this.value.setValue(form.value);
      this.language.setValue(form.language || null);
      this.rank.setValue(form.rank || 0);
      this.tags.setValue(
        this.mapIdsToEntries(form.tags || [], this.tagEntries())
      );
      this.note.setValue(form.note || null);
      this.referenceForm.setValue(form.referenceForm || null);
      this.operations.setValue(
        form.operations?.map((s) => EditOperation.parseOperation(s)) || []
      );
      this.isValueTarget.setValue(form.isValueTarget || false);
      this.references.setValue(form.references || []);
      this.links.setValue(form.links || []);
      this.formCtl.markAsPristine();
    }
  }

  public onTagEntriesChange(entries: ThesaurusEntry[]): void {
    this.tags.setValue(entries);
    this.tags.markAsDirty();
    this.tags.updateValueAndValidity();
  }

  public onOperationsChange(operations: EditOperation[]): void {
    this.operations.setValue(operations);
    this.operations.markAsDirty();
    this.operations.updateValueAndValidity();
  }

  public onReferencesChange(references: DocReference[]): void {
    this.references.setValue(references);
    this.references.markAsDirty();
    this.references.updateValueAndValidity();
  }

  public onLinksChange(links: AssertedCompositeId[]): void {
    this.links.setValue(links);
    this.links.markAsDirty();
    this.links.updateValueAndValidity();
  }

  private getForm(): NotableWordForm {
    return {
      value: this.value.value.trim(),
      language: this.language.value || undefined,
      rank: this.rank.value || undefined,
      tags: this.tags.value.length
        ? this.tags.value.map((e) => e.id)
        : undefined,
      note: this.note.value?.trim() || undefined,
      referenceForm: this.referenceForm.value?.trim() || undefined,
      operations: this.operations.value.length
        ? this.operations.value.map((op) => op.toString())
        : undefined,
      isValueTarget: this.isValueTarget.value ? true : undefined,
      references: this.references.value.length
        ? this.references.value
        : undefined,
      links: this.links.value.length ? this.links.value : undefined,
    };
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Saves the current form data by updating the `data` model signal.
   * This method can be called manually (e.g., by a Save button) or
   * automatically (via auto-save).
   * @param pristine If true (default), the form is marked as pristine
   * after saving.
   * Set to false for auto-save if you want the form to remain dirty.
   */
  public save(pristine = true): void {
    if (this.formCtl.invalid) {
      // show validation errors
      this.formCtl.markAllAsTouched();
      return;
    }

    const form = this.getForm();
    this.form.set(form);

    if (pristine) {
      this.formCtl.markAsPristine();
    }
  }
}
