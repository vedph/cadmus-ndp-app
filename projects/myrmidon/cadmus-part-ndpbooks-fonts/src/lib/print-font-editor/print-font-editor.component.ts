import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

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
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import { PrintFont } from '../print-fonts-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * The editable draft behind the form.
 */
interface PrintFontControls {
  eid: string;
  family: string;
  sections: string[];
  features: string[];
  ids: AssertedCompositeId[];
  note: string;
}

/**
 * Print font -> draft.
 */
function toDraft(font?: PrintFont | null): PrintFontControls {
  return {
    eid: font?.eid || '',
    family: font?.family || '',
    sections: [...(font?.sections || [])],
    features: [...(font?.features || [])],
    ids: copyFormValue(font?.ids || []),
    note: font?.note || '',
  };
}

/**
 * Draft -> print font.
 */
function toModel(draft: PrintFontControls): PrintFont {
  return {
    eid: draft.eid.trim() || undefined,
    family: draft.family.trim(),
    sections: draft.sections.length ? [...draft.sections] : undefined,
    features: draft.features.length ? [...draft.features] : undefined,
    ids: draft.ids.length ? copyFormValue(draft.ids) : undefined,
    note: draft.note.trim() || undefined,
  };
}

/**
 * Editor for a single print font.
 */
@Component({
  selector: 'cadmus-print-font-editor',
  imports: [
    FormField,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  // asserted-id-features
  public readonly idFeatureEntries = input<ThesaurusEntry[]>();

  // flags mapped from thesaurus entries
  public sectionFlags = computed<Flag[]>(
    () => this.sectionEntries()?.map((e) => entryToFlag(e)) || [],
  );
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  // the draft is rebuilt from each new bound font
  private readonly _draft = linkedSignal(() => toDraft(this.font()));
  public readonly form = form(this._draft);

  constructor() {
    // when the draft mirrors the bound font, there are no unsaved edits
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  /** True when the draft still mirrors the bound font. */
  private isDraftInSync(draft: PrintFontControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.font()));
  }

  public onSectionCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.sections, [...(ids || [])]);
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  public onIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.ids, copyFormValue(ids || []));
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
   * Saves the current form data by updating the `font` model signal.
   * @param pristine If true (default), the form's interaction state is
   * cleared after saving.
   */
  public save(pristine = true): void {
    if (this.form().invalid()) {
      // show validation errors
      this.form().markAsTouched();
      return;
    }

    this.font.set(toModel(this._draft()));

    if (pristine) {
      this.form().reset();
    }
  }
}
