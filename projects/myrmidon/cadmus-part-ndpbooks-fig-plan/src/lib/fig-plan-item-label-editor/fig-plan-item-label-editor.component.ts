import { CommonModule } from '@angular/common';
import { Component, effect, input, model, output, signal } from '@angular/core';
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
import { DialogService } from '@myrmidon/ngx-mat-tools';
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

  public readonly edited = signal<PrintFont | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  constructor(formBuilder: FormBuilder, private _dialogService: DialogService) {
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

  public addFont(): void {
    const font: PrintFont = {
      family: '',
    };
    this.editFont(font, -1);
  }

  public editFont(font: PrintFont, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(font);
  }

  public closeFont(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveFont(entry: PrintFont): void {
    const fonts = [...this.fonts.value];
    if (this.editedIndex() === -1) {
      fonts.push(entry);
    } else {
      fonts.splice(this.editedIndex(), 1, entry);
    }
    this.fonts.setValue(fonts);
    this.fonts.markAsDirty();
    this.fonts.updateValueAndValidity();
    this.closeFont();
  }

  public deleteFont(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Font?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeFont();
          }
          const fonts = [...this.fonts.value];
          fonts.splice(index, 1);
          this.fonts.setValue(fonts);
          this.fonts.markAsDirty();
          this.fonts.updateValueAndValidity();
        }
      });
  }

  public moveFontUp(index: number): void {
    if (index < 1) {
      return;
    }
    const font = this.fonts.value[index];
    const fonts = [...this.fonts.value];
    fonts.splice(index, 1);
    fonts.splice(index - 1, 0, font);
    this.fonts.setValue(fonts);
    this.fonts.markAsDirty();
    this.fonts.updateValueAndValidity();
  }

  public moveFontDown(index: number): void {
    if (index + 1 >= this.fonts.value.length) {
      return;
    }
    const font = this.fonts.value[index];
    const fonts = [...this.fonts.value];
    fonts.splice(index, 1);
    fonts.splice(index + 1, 0, font);
    this.fonts.setValue(fonts);
    this.fonts.markAsDirty();
    this.fonts.updateValueAndValidity();
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Saves the current form data by updating the `label` model signal.
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
