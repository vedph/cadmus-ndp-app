import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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

import {
  Citation,
  CitationSpan,
  CitSchemeService,
  CompactCitationComponent,
} from '@myrmidon/cadmus-refs-citation';
import { ThesaurusEntriesPickerComponent } from '@myrmidon/cadmus-thesaurus-store';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { TextPassage } from '../text-passages-part';

/**
 * Editor for a single text passage.
 */
@Component({
  selector: 'cadmus-text-passage-editor',
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
    CompactCitationComponent,
    ThesaurusEntriesPickerComponent,
  ],
  templateUrl: './text-passage-editor.component.html',
  styleUrl: './text-passage-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPassageEditorComponent {
  /**
   * The text passage to edit. This implies a dataChange event when the user
   * saves the form.
   */
  public readonly data = model<TextPassage | undefined>();
  /**
   * Emitted when the user cancels editing.
   */
  public readonly cancelEdit = output();

  // text-passage-tags
  public readonly tagEntries = input<ThesaurusEntry[] | undefined>();
  // text-passage-features
  public readonly featureEntries = input<ThesaurusEntry[] | undefined>();

  public citation: FormControl<Citation | CitationSpan | null>;
  public tag: FormControl<string | null>;
  public features: FormControl<ThesaurusEntry[]>;
  public text: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(
    formBuilder: FormBuilder,
    private _citService: CitSchemeService,
  ) {
    // form
    this.citation = formBuilder.control<Citation | CitationSpan | null>(null, {
      validators: Validators.required,
    });
    this.tag = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(100),
    });
    this.features = formBuilder.control<ThesaurusEntry[]>([], {
      nonNullable: true,
    });
    this.text = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(5000),
    });
    this.note = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(5000),
    });
    this.form = formBuilder.group({
      citation: this.citation,
      tag: this.tag,
      features: this.features,
      text: this.text,
      note: this.note,
    });

    // when model changes, update form
    effect(() => {
      const data = this.data();
      this.updateForm(data);
    });
  }

  private updateForm(data: TextPassage | undefined | null): void {
    if (!data) {
      this.form.reset();
    } else {
      // parse as single citation or span
      if (data.citation.includes(' - ')) {
        this.citation.setValue(
          this._citService.parseSpan(data.citation, 'dc') || null,
        );
      } else {
        this.citation.setValue(
          this._citService.parse(data.citation, 'dc') || null,
        );
      }
      this.tag.setValue(data.tag || null);
      this.features.setValue(
        data.features
          ? data.features
              .map((f) => this.featureEntries()?.find((e) => e.id === f)!)
              .filter((e) => !!e) || []
          : [],
      );
      this.text.setValue(data.text || null);
      this.note.setValue(data.note || null);
      this.form.markAsPristine();
    }
  }

  public onCitationChange(citation: Citation | CitationSpan | null): void {
    this.citation.setValue(citation);
    this.citation.markAsDirty();
    this.citation.updateValueAndValidity();
  }

  public onFeaturesChange(entries: ThesaurusEntry[]): void {
    this.features.setValue(entries);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  private getData(): TextPassage {
    return {
      citation: this.citation.value
        ? this._citService.toString(this.citation.value!)
        : '',
      tag: this.tag.value || undefined,
      features: this.features.value?.length
        ? this.features.value.map((e) => e.id)
        : undefined,
      text: this.text.value || undefined,
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

    const data = this.getData();
    this.data.set(data);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}
