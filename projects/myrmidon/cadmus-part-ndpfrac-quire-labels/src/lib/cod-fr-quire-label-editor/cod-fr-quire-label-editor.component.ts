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
import { form, FormField, maxLength } from '@angular/forms/signals';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// myrmidon
import { NgxToolsSignalValidators } from '@myrmidon/ngx-tools';

// bricks
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';
import { isImplicitSubmission, setFieldFromChild } from '@myrmidon/cadmus-ui';

import { CodFrQuireLabel } from '../cod-fr-quire-labels-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * The editable draft behind the form.
 */
interface CodFrQuireLabelControls {
  types: string[];
  positions: string[];
  text: string;
  handId: AssertedCompositeId | null;
  ink: string;
  note: string;
}

/**
 * Model -> draft.
 */
function toDraft(label?: CodFrQuireLabel | null): CodFrQuireLabelControls {
  return {
    types: [...(label?.types || [])],
    positions: [...(label?.positions || [])],
    text: label?.text || '',
    handId: label?.handId || null,
    ink: label?.ink || '',
    note: label?.note || '',
  };
}

/**
 * Draft -> model.
 */
function toModel(v: CodFrQuireLabelControls): CodFrQuireLabel {
  return {
    types: [...v.types],
    positions: [...v.positions],
    text: v.text.trim() || undefined,
    handId: v.handId || undefined,
    ink: v.ink.trim() || undefined,
    note: v.note.trim() || undefined,
  };
}

@Component({
  selector: 'cadmus-cod-fr-quire-label-editor',
  imports: [
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FlagSetComponent,
    AssertedCompositeIdComponent,
  ],
  templateUrl: './cod-fr-quire-label-editor.component.html',
  styleUrl: './cod-fr-quire-label-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodFrQuireLabelEditorComponent {
  public readonly label = model<CodFrQuireLabel | undefined>();
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
  // asserted-id-features
  public readonly idFeatureEntries = input<ThesaurusEntry[]>();

  // cod-fr-quire-label-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // flags mapped from thesaurus entries
  public typeFlags = computed<Flag[]>(
    () => this.typeEntries()?.map((e) => entryToFlag(e)) || [],
  );

  // cod-fr-quire-label-positions
  public readonly positionEntries = input<ThesaurusEntry[]>();
  // flags mapped from thesaurus entries
  public positionFlags = computed<Flag[]>(
    () => this.positionEntries()?.map((e) => entryToFlag(e)) || [],
  );

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  // the draft is rebuilt from each new bound label
  private readonly _draft = linkedSignal(() => toDraft(this.label()));
  public readonly form = form(this._draft, (p) => {
    NgxToolsSignalValidators.strictMinLength(p.types, 1);
    NgxToolsSignalValidators.strictMinLength(p.positions, 1);
    maxLength(p.text, 500);
    maxLength(p.ink, 1000);
    maxLength(p.note, 1000);
  });

  constructor() {
    // when the draft mirrors the bound label, there are no unsaved edits
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  /** True when the draft still mirrors the bound label. */
  private isDraftInSync(draft: CodFrQuireLabelControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.label()));
  }

  public onTypeCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.types, [...(ids || [])]);
  }

  public onPositionCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.positions, [...(ids || [])]);
  }

  public onHandIdChange(id: AssertedCompositeId | null): void {
    setFieldFromChild(this.form.handId, id || null);
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
   * Saves the current form data by updating the `label` model signal.
   * @param pristine If true (default), the form's interaction state is
   * cleared after saving.
   */
  public save(pristine = true): void {
    if (this.form().invalid()) {
      // show validation errors
      this.form().markAsTouched();
      return;
    }

    this.label.set(toModel(this._draft()));

    if (pristine) {
      this.form().reset();
    }
  }
}
