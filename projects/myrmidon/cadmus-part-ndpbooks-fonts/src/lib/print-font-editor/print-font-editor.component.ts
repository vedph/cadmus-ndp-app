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
} from '@angular/forms';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { PrintFont } from '../print-fonts-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * Editor for a single print font.
 */
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
    AssertedCompositeIdsComponent,
    FlagSetComponent,
  ],
  templateUrl: './print-font-editor.component.html',
  styleUrl: './print-font-editor.component.css',
})
export class PrintFontEditorComponent {
  public readonly font = model<PrintFont | undefined>();
  public readonly cancelEdit = output();

  // print-font-families
  public readonly familyEntries = input<ThesaurusEntry[]>();
  // print-layout-sections
  public readonly sectionEntries = input<ThesaurusEntry[]>();
  // print-font-features
  public readonly featureEntries = input<ThesaurusEntry[]>();

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

  // flags mapped from thesaurus entries
  public sectionFlags = computed<Flag[]>(
    () => this.sectionEntries()?.map((e) => entryToFlag(e)) || []
  );
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || []
  );

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

  public onSectionCheckedIdsChange(ids: string[]): void {
    this.sections.setValue(ids);
    this.sections.markAsDirty();
    this.sections.updateValueAndValidity();
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    this.ids.setValue(ids);
    this.ids.markAsDirty();
    this.ids.updateValueAndValidity();
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
