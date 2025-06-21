import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
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

// myrmidon
import { NgxToolsValidators } from '@myrmidon/ngx-tools';

// bricks
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodFrQuireLabel } from '../cod-fr-quire-labels-part';
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

@Component({
  selector: 'cadmus-cod-fr-quire-label-editor',
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
    // bricks
    FlagSetComponent,
    AssertedCompositeIdComponent,
  ],
  templateUrl: './cod-fr-quire-label-editor.component.html',
  styleUrl: './cod-fr-quire-label-editor.component.css',
})
export class CodFrQuireLabelEditorComponent {
  public readonly data = model<CodFrQuireLabel | undefined>();
  public readonly cancelEdit = output();

  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // external-id-tags
  public readonly idTagEntries = input<ThesaurusEntry[]>();
  // external-id-scopes
  public readonly idScopeEntries = input<ThesaurusEntry[]>();

  // cod-fr-quire-label-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // flags mapped from thesaurus entries
  public typeFlags = computed<Flag[]>(
    () => this.typeEntries()?.map((e) => entryToFlag(e)) || []
  );

  // cod-fr-quire-label-positions
  public readonly positionEntries = input<ThesaurusEntry[]>();
  // flags mapped from thesaurus entries
  public positionFlags = computed<Flag[]>(
    () => this.positionEntries()?.map((e) => entryToFlag(e)) || []
  );

  public types: FormControl<string[]>;
  public positions: FormControl<string[]>;
  public text: FormControl<string | null>;
  public handId: FormControl<AssertedCompositeId | null>;
  public ink: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  // track if the form is currently being updated programmatically
  private _updatingForm = false;

  constructor(private formBuilder: FormBuilder) {
    // form
    this.types = this.formBuilder.control<string[]>([], {
      nonNullable: true,
      validators: [NgxToolsValidators.strictMinLengthValidator(1)],
    });
    this.positions = this.formBuilder.control<string[]>([], {
      nonNullable: true,
      validators: [NgxToolsValidators.strictMinLengthValidator(1)],
    });
    this.text = this.formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(500)],
    });
    this.handId = this.formBuilder.control<AssertedCompositeId | null>(null);
    this.ink = this.formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(1000)],
    });
    this.note = this.formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(1000)],
    });
    this.form = formBuilder.group({
      types: this.types,
      positions: this.positions,
      text: this.text,
      handId: this.handId,
      ink: this.ink,
      note: this.note,
    });

    // when model changes, update form
    effect(() => {
      const data = this.data();
      this.updateForm(data);
    });
  }

  private updateForm(data: CodFrQuireLabel | undefined | null): void {
    this._updatingForm = true;

    if (!data) {
      this.form.reset();
    } else {
      this.types.setValue(data.types || [], { emitEvent: false });
      this.positions.setValue(data.positions || [], { emitEvent: false });
      this.text.setValue(data.text || null, { emitEvent: false });
      this.handId.setValue(data.handId || null, { emitEvent: false });
      this.ink.setValue(data.ink || null, { emitEvent: false });
      this.note.setValue(data.note || null, { emitEvent: false });
    }

    this.form.markAsPristine();

    // reset guard only after marking controls
    this._updatingForm = false;
  }

  private getData(): CodFrQuireLabel {
    return {
      types: this.types.value,
      positions: this.positions.value,
      text: this.text.value?.trim() || undefined,
      handId: this.handId.value || undefined,
      ink: this.ink.value?.trim() || undefined,
      note: this.note.value?.trim() || undefined,
    };
  }

  public onTypeCheckedIdsChange(ids: string[]): void {
    this.types.setValue(ids);
    this.types.markAsDirty();
    this.types.updateValueAndValidity();
  }

  public onPositionCheckedIdsChange(ids: string[]): void {
    this.positions.setValue(ids);
    this.positions.markAsDirty();
    this.positions.updateValueAndValidity();
  }

  public onHandIdChange(id: AssertedCompositeId | null): void {
    this.handId.setValue(id);
    this.handId.markAsDirty();
    this.handId.updateValueAndValidity();
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

    const data = this.getData();
    this.data.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}
