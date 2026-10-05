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
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

// cadmus
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { isImplicitSubmission, setFieldFromChild } from '@myrmidon/cadmus-ui';

import { CodFrRuling } from '../cod-fr-rulings-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * The editable draft behind the form.
 */
interface CodFrRulingControls {
  features: string[];
  system: string;
  type: string;
  note: string;
}

/**
 * Model -> draft.
 */
function toDraft(ruling?: CodFrRuling | null): CodFrRulingControls {
  return {
    features: [...(ruling?.features || [])],
    system: ruling?.system || '',
    type: ruling?.type || '',
    note: ruling?.note || '',
  };
}

/**
 * Draft -> model.
 */
function toModel(v: CodFrRulingControls): CodFrRuling {
  return {
    features: [...v.features],
    system: v.system.trim() || undefined,
    type: v.type.trim() || undefined,
    note: v.note.trim() || undefined,
  };
}

@Component({
  selector: 'cadmus-cod-fr-ruling-editor',
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
  ],
  templateUrl: './cod-fr-ruling-editor.component.html',
  styleUrl: './cod-fr-ruling-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );

  // the draft is rebuilt from each new bound ruling
  private readonly _draft = linkedSignal(() => toDraft(this.ruling()));
  public readonly form = form(this._draft, (p) => {
    maxLength(p.system, 100);
    maxLength(p.type, 100);
    NgxToolsSignalValidators.strictMinLength(p.features, 1);
    maxLength(p.note, 500);
  });

  constructor() {
    // when the draft mirrors the bound ruling, there are no unsaved edits
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  /** True when the draft still mirrors the bound ruling. */
  private isDraftInSync(draft: CodFrRulingControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.ruling()));
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
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
   * Saves the current form data by updating the `ruling` model signal.
   * @param pristine If true (default), the form's interaction state is
   * cleared after saving.
   */
  public save(pristine = true): void {
    if (this.form().invalid()) {
      // show validation errors
      this.form().markAsTouched();
      return;
    }

    this.ruling.set(toModel(this._draft()));

    if (pristine) {
      this.form().reset();
    }
  }
}
