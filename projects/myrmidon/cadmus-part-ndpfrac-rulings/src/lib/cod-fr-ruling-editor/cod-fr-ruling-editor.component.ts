import { CommonModule } from '@angular/common';
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

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// myrmidon
import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodFrRuling } from '../cod-fr-rulings-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-fr-ruling-editor',
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
    FlagSetComponent,
  ],
  templateUrl: './cod-fr-ruling-editor.component.html',
  styleUrl: './cod-fr-ruling-editor.component.css',
})
export class CodFrRulingEditorComponent {
  public readonly ruling = model<CodFrRuling | undefined>();
  public readonly cancelEdit = output();
  // cod-fr-ruling-features
  public readonly featureEntries = input<ThesaurusEntry[]>();
  // cod-fr-ruling-systems
  public readonly systemEntries = input<ThesaurusEntry[]>();
  // cod-fr-ruling-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || []
  );

  public features: FormControl<string[]>;
  public system: FormControl<string | null>;
  public type: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // track if the form is currently being updated programmatically
  private _updatingForm = false;

  constructor(private formBuilder: FormBuilder) {
    // form
    this.system = this.formBuilder.control<string | null>(null, [
      Validators.maxLength(100),
    ]);
    this.type = this.formBuilder.control<string | null>(null, [
      Validators.maxLength(100),
    ]);
    this.features = this.formBuilder.control<string[]>([], {
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
    this.note = this.formBuilder.control<string | null>(null, [
      Validators.maxLength(500),
    ]);
    this.form = formBuilder.group({
      features: this.features,
      system: this.system,
      type: this.type,
      note: this.note,
    });

    // when model changes, update form
    effect(() => {
      const ruling = this.ruling();
      this.updateForm(ruling);
    });
  }

  private updateForm(ruling: CodFrRuling | undefined | null): void {
    this._updatingForm = true;

    if (!ruling) {
      this.form.reset();
    } else {
      this.features.setValue(ruling.features ?? [], { emitEvent: false });
      this.system.setValue(ruling.system ?? null, { emitEvent: false });
      this.type.setValue(ruling.type ?? null, { emitEvent: false });
      this.note.setValue(ruling.note ?? null, { emitEvent: false });
    }

    this.form.markAsPristine();

    // reset guard only after marking controls
    this._updatingForm = false;
  }

  private getRuling(): CodFrRuling {
    return {
      features: this.features.value,
      system: this.system.value?.trim() || undefined,
      type: this.type.value?.trim() || undefined,
      note: this.note.value?.trim() || undefined,
    };
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }
  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Saves the current form data by updating the `ruling` model signal.
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

    const ruling = this.getRuling();
    this.ruling.set(ruling);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}
