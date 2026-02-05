import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';

import {
  LookupDocReferencesComponent,
  LookupDocReferenceComponent,
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
    LookupDocReferenceComponent,
  ],
  templateUrl: './notable-word-form-editor.component.html',
  styleUrl: './notable-word-form-editor.component.css',
})
export class NotableWordFormEditorComponent {
  // signals tracking form control values (initialized in constructor)
  private readonly _valueSignal: Signal<string>;
  private readonly _referenceFormSignal: Signal<string | null>;
  private readonly _isValueTargetSignal: Signal<boolean>;
  private readonly _operationsSignal: Signal<EditOperation[]>;

  public readonly form = model<NotableWordForm | undefined>();
  public readonly cancelEdit = output();

  /**
   * The source text for transformation via operations.
   * This is referenceForm when isValueTarget is true (ref → value), or
   * value when isValueTarget is false (value → ref).
   */
  public readonly sourceText: Signal<string | undefined>;

  /**
   * The target text for transformation via operations.
   * This is value when isValueTarget is true (ref → value), or
   * referenceForm when isValueTarget is false (value → ref).
   */
  public readonly targetText: Signal<string | undefined>;

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

    // create signals from form control value changes
    this._valueSignal = toSignal(
      this.value.valueChanges.pipe(takeUntilDestroyed()),
      {
        initialValue: this.value.value,
      },
    );
    this._referenceFormSignal = toSignal(
      this.referenceForm.valueChanges.pipe(takeUntilDestroyed()),
      {
        initialValue: this.referenceForm.value,
      },
    );
    this._isValueTargetSignal = toSignal(
      this.isValueTarget.valueChanges.pipe(takeUntilDestroyed()),
      {
        initialValue: this.isValueTarget.value,
      },
    );
    this._operationsSignal = toSignal(
      this.operations.valueChanges.pipe(takeUntilDestroyed()),
      {
        initialValue: this.operations.value,
      },
    );

    // create computed signals for source and target text
    this.sourceText = computed<string | undefined>(() => {
      const refForm = this._referenceFormSignal();
      const val = this._valueSignal();
      if (!refForm || !val) return undefined;
      const result = this._isValueTargetSignal()
        ? refForm || val
        : val || refForm;
      console.log('sourceText', result);
      return result;
    });

    this.targetText = computed<string | undefined>(() => {
      const refForm = this._referenceFormSignal();
      const val = this._valueSignal();
      if (!refForm || !val) return undefined;
      const result = this._isValueTargetSignal() ? val : refForm || val;
      console.log('targetText', result);
      return result;
    });

    // when model changes, update form
    effect(() => {
      const form = this.form();
      this.updateForm(form);
    });

    // disable value and referenceForm when operations are present
    effect(() => {
      const ops = this._operationsSignal();
      if (ops && ops.length > 0) {
        // disable both controls when operations exist
        this.value.disable({ emitEvent: false });
        this.referenceForm.disable({ emitEvent: false });
      } else {
        // enable both controls when no operations
        this.value.enable({ emitEvent: false });
        this.referenceForm.enable({ emitEvent: false });
      }
    });
  }

  private mapIdsToEntries(
    ids: string[],
    entries: ThesaurusEntry[] | undefined,
  ): ThesaurusEntry[] {
    if (!entries) return ids.map((id) => ({ id, value: id }));
    return ids.map(
      (id) => entries.find((e) => e.id === id) || { id, value: id },
    );
  }

  private updateForm(form: NotableWordForm | undefined | null): void {
    if (!form) {
      this.formCtl.reset();
      // ensure controls are enabled when form is reset
      this.value.enable({ emitEvent: false });
      this.referenceForm.enable({ emitEvent: false });
    } else {
      const parsedOperations =
        form.operations?.map((s) => EditOperation.parseOperation(s)) || [];

      this.value.setValue(form.value);
      this.language.setValue(form.language || null);
      this.rank.setValue(form.rank || 0);
      this.tags.setValue(
        this.mapIdsToEntries(form.tags || [], this.tagEntries()),
      );
      this.note.setValue(form.note || null);
      this.referenceForm.setValue(form.referenceForm || null);
      this.operations.setValue(parsedOperations);
      this.isValueTarget.setValue(form.isValueTarget || false);
      this.references.setValue(form.references || []);
      this.links.setValue(form.links || []);

      // disable/enable controls based on operations presence
      if (parsedOperations.length > 0) {
        this.value.disable({ emitEvent: false });
        this.referenceForm.disable({ emitEvent: false });
      } else {
        this.value.enable({ emitEvent: false });
        this.referenceForm.enable({ emitEvent: false });
      }

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
