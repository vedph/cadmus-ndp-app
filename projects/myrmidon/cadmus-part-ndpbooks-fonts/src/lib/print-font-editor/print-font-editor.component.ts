import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, model, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  takeUntil,
} from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrintFont } from '../print-fonts-part';
import { AssertedCompositeId } from '@myrmidon/cadmus-refs-asserted-ids';

@Component({
  selector: 'cadmus-print-font-editor',
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
  templateUrl: './print-font-editor.component.html',
  styleUrl: './print-font-editor.component.css',
})
export class PrintFontEditorComponent {
  public readonly font = model<PrintFont | undefined>();
  public readonly cancelEdit = output();

  public eid: FormControl<string | null>;
  public family: FormControl<string>;
  public sections: FormControl<string[]>;
  public features: FormControl<string[]>;
  public ids: FormControl<AssertedCompositeId[]>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // track if the form is currently being updated programmatically
  private _updatingForm = false;

  constructor(private formBuilder: FormBuilder) {
    // form
    this.eid = formBuilder.control<string | null>(null);
    this.family = formBuilder.control<string>('', { nonNullable: true });
    this.sections = formBuilder.control<string[]>([], { nonNullable: true });
    this.features = formBuilder.control<string[]>([], { nonNullable: true });
    this.ids = formBuilder.control<AssertedCompositeId[]>([], {
      nonNullable: true,
    });
    this.note = formBuilder.control<string | null>(null);
    this.form = formBuilder.group({
      eid: this.eid,
      family: this.family,
      sections: this.sections,
      features: this.features,
      ids: this.ids,
      note: this.note,
    });

    // when model changes, update form
    effect(() => {
      const data = this.font();
      this.updateForm(data);
    });
  }

  private updateForm(font: PrintFont | undefined | null): void {
    this._updatingForm = true;

    if (!font) {
      this.form.reset();
    } else {
      this.eid.setValue(font.eid ?? null, { emitEvent: false });
      this.family.setValue(font.family ?? '', { emitEvent: false });
      this.sections.setValue(font.sections ?? [], { emitEvent: false });
      this.features.setValue(font.features ?? [], { emitEvent: false });
      this.ids.setValue(font.ids ?? [], { emitEvent: false });
      this.note.setValue(font.note ?? null, { emitEvent: false });
    }

    this.form.markAsPristine();

    // reset guard only after marking controls
    this._updatingForm = false;
  }

  private getFont(): PrintFont {
    return {
      eid: this.eid.value || undefined,
      family: this.family.value,
      sections: this.sections.value?.length ? this.sections.value : undefined,
      features: this.features.value?.length ? this.features.value : undefined,
      ids: this.ids.value?.length ? this.ids.value : undefined,
      note: this.note.value || undefined,
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

    const data = this.getFont();
    this.font.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}
