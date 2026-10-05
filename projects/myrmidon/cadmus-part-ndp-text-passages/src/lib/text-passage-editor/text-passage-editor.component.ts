import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, FormField, maxLength } from '@angular/forms/signals';

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
import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { isImplicitSubmission, setFieldFromChild } from '@myrmidon/cadmus-ui';

import { TextPassage } from '../text-passages-part';

/**
 * The editable draft behind the form.
 */
interface TextPassageControls {
  // used when there is a citation scheme
  citation: Citation | CitationSpan | null;
  // used when there is no citation scheme
  freeCitation: string;
  tag: string;
  // feature IDs: the picker's entries are derived from them
  features: string[];
  text: string;
  note: string;
}

/**
 * Text passage -> draft.
 * @param data The text passage.
 * @param schemeKey The citation scheme key, or null/undefined for a free
 * text citation.
 * @param citService The citation scheme service used to parse citations.
 */
function toDraft(
  data: TextPassage | undefined | null,
  schemeKey: string | undefined | null,
  citService: CitSchemeService,
): TextPassageControls {
  let citation: Citation | CitationSpan | null = null;
  if (data && schemeKey) {
    // parse as single citation or span
    citation =
      (data.citation.includes(' - ')
        ? citService.parseSpan(data.citation, schemeKey)
        : citService.parse(data.citation, schemeKey)) || null;
  }
  return {
    citation,
    freeCitation: !schemeKey ? data?.citation || '' : '',
    tag: data?.tag || '',
    features: [...(data?.features || [])],
    text: data?.text || '',
    note: data?.note || '',
  };
}

/**
 * Editor for a single text passage.
 */
@Component({
  selector: 'cadmus-text-passage-editor',
  imports: [
    CommonModule,
    FormField,
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
  private readonly _citService = inject(CitSchemeService);

  /**
   * The text passage to edit. This implies a dataChange event when the user
   * saves the form.
   */
  public readonly data = model<TextPassage | undefined>();
  /**
   * Emitted when the user cancels editing.
   */
  public readonly cancelEdit = output();

  /**
   * The citation scheme key to use for parsing and formatting the citation.
   * If undefined or null, a free text citation is used.
   * Default is 'dc' (Dante's Commedia).
   */
  public readonly citSchemeKey = input<string | undefined | null>('dc');

  // text-passage-tags
  public readonly tagEntries = input<ThesaurusEntry[] | undefined>();
  // text-passage-features
  public readonly featureEntries = input<ThesaurusEntry[] | undefined>();

  // the draft is rebuilt from each new passage or citation scheme
  private readonly _draft = linkedSignal(() =>
    toDraft(this.data(), this.citSchemeKey(), this._citService),
  );

  public readonly form = form(this._draft, (p) => {
    maxLength(p.freeCitation, 100);
    maxLength(p.tag, 100);
    maxLength(p.text, 5000);
    maxLength(p.note, 5000);
    NgxToolsSignalValidators.atLeastOneRequired(p, [
      p.citation,
      p.freeCitation,
    ]);
  });

  /**
   * The picked feature entries, from the draft's feature IDs. Only IDs
   * found in the features thesaurus are shown.
   */
  public readonly featurePickerEntries = computed<ThesaurusEntry[]>(() => {
    const entries = this.featureEntries();
    return this.form
      .features()
      .value()
      .map((id) => entries?.find((e) => e.id === id))
      .filter((e): e is ThesaurusEntry => !!e);
  });

  constructor() {
    // when the draft mirrors the bound passage, there are no unsaved edits
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  /** True when the draft still mirrors the bound passage. */
  private isDraftInSync(draft: TextPassageControls): boolean {
    return (
      JSON.stringify(draft) ===
      JSON.stringify(
        toDraft(this.data(), this.citSchemeKey(), this._citService),
      )
    );
  }

  public onCitationChange(citation: Citation | CitationSpan | null): void {
    setFieldFromChild(this.form.citation, citation || null);
  }

  public onFeaturesChange(entries: ThesaurusEntry[]): void {
    setFieldFromChild(
      this.form.features,
      (entries || []).map((e) => e.id),
    );
  }

  private getData(): TextPassage {
    const draft = this._draft();
    return {
      citation: this.citSchemeKey()
        ? draft.citation
          ? this._citService.toString(draft.citation)
          : ''
        : draft.freeCitation.trim(),
      tag: draft.tag.trim() || undefined,
      features: draft.features.length ? [...draft.features] : undefined,
      text: draft.text.trim() || undefined,
      note: draft.note.trim() || undefined,
    };
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
    if (this.form().valid() && this.form().dirty()) {
      this.save();
    }
  }

  /**
   * Saves the current form data by updating the `data` model signal.
   * @param pristine If true (default), the form's interaction state is
   * cleared after saving.
   */
  public save(pristine = true): void {
    if (this.form().invalid()) {
      // show validation errors
      this.form().markAsTouched();
      return;
    }

    this.data.set(this.getData());

    if (pristine) {
      this.form().reset();
    }
  }
}
