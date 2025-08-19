import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, input, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { PrintFont } from '@myrmidon/cadmus-part-ndpbooks-fonts';

import { FigPlanItemLabel } from '../print-fig-plan-impl-part';

/**
 * Editor for a figurative plan item's label.
 */
@Component({
  selector: 'cadmus-fig-plan-item-label-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './fig-plan-item-label-editor.component.html',
  styleUrl: './fig-plan-item-label-editor.component.css',
})
export class FigPlanItemLabelEditorComponent {
  public readonly label = model<FigPlanItemLabel | undefined>();
  public readonly cancelEdit = output();
  // fig-plan-item-label-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // fig-plan-item-label-languages
  public readonly languageEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-features
  public readonly featureEntries = input<ThesaurusEntry[]>();
  // asserted-id-scopes
  public readonly assIdScopeEntries = input<ThesaurusEntry[]>();
  // asserted-id-tags
  public readonly assIdTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly docRefTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly docRefTagEntries = input<ThesaurusEntry[]>();

  public type: FormControl<string>;
  public languages: FormControl<string[]>;
  public value: FormControl<string | null>;
  public note: FormControl<string | null>;
  public fonts: FormControl<PrintFont[]>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.type = formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    });
    this.languages = formBuilder.control([], {
      nonNullable: true,
      validators: [Validators.maxLength(100)],
    });
    this.value = formBuilder.control(null, {
      validators: [Validators.maxLength(500)],
    });
    this.note = formBuilder.control(null, {
      validators: [Validators.maxLength(1000)],
    });
    this.fonts = formBuilder.control([], {
      nonNullable: true,
      validators: [Validators.required],
    });
    this.form = formBuilder.group({
      type: this.type,
      languages: this.languages,
      value: this.value,
      note: this.note,
      fonts: this.fonts,
    });

    // when model changes, update form
    effect(() => {
      const data = this.label();
      this.updateForm(data);
    });
  }

  private updateForm(label: FigPlanItemLabel | undefined | null): void {
    if (!label) {
      this.form.reset();
    } else {
      this.type.setValue(label.type, { emitEvent: false });
      this.languages.setValue(label.languages || [], { emitEvent: false });
      this.value.setValue(label.value || '', { emitEvent: false });
      this.note.setValue(label.note || null, { emitEvent: false });
      this.fonts.setValue(label.fonts || [], { emitEvent: false });
    }

    this.form.markAsPristine();
  }

  private getLabel(): FigPlanItemLabel {
    return {
      type: this.type.value,
      languages: this.languages.value,
      value: this.value.value || undefined,
      note: this.note.value || undefined,
      fonts: this.fonts.value?.length ? this.fonts.value : undefined,
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
    if (this.form.invalid) {
      // show validation errors
      this.form.markAllAsTouched();
      return;
    }

    const data = this.getLabel();
    this.label.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}
