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
import { form, FormField, maxLength, required } from '@angular/forms/signals';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  Citation,
  CitationSpan,
  CitSchemeService,
  CompactCitationComponent,
} from '@myrmidon/cadmus-refs-citation';
import { isImplicitSubmission, setFieldFromChild } from '@myrmidon/cadmus-ui';

import { FigPlanItem } from '../print-fig-plan-part';

/**
 * The editable draft behind the form.
 */
interface FigPlanItemControls {
  eid: string;
  type: string;
  citation: string;
}

/**
 * Item -> draft.
 */
function toDraft(item?: FigPlanItem | null): FigPlanItemControls {
  return {
    eid: item?.eid || '',
    type: item?.type || '',
    citation: item?.citation || '',
  };
}

/**
 * Draft -> item.
 */
function toModel(draft: FigPlanItemControls): FigPlanItem {
  return {
    eid: draft.eid.trim(),
    type: draft.type.trim(),
    citation: draft.citation.trim() || undefined,
  };
}

/**
 * Editor for a figure plan item.
 */
@Component({
  selector: 'cadmus-fig-plan-item-editor',
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    CompactCitationComponent,
  ],
  templateUrl: './fig-plan-item-editor.component.html',
  styleUrl: './fig-plan-item-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FigPlanItemEditorComponent {
  private readonly _citService = inject(CitSchemeService);

  public readonly item = model<FigPlanItem | undefined>();
  public readonly cancelEdit = output();

  public readonly typeEntries = input<ThesaurusEntry[]>();

  // the citation passed to the citation editor: it is parsed from the bound
  // item only, so that the editor is not reset by its own changes
  public readonly editedCit = computed<Citation | CitationSpan | undefined>(
    () => {
      const citation = this.item()?.citation;
      if (!citation) {
        return undefined;
      }
      // parse citation, whether it's a span or a single one
      return (
        (citation.includes(' - ')
          ? this._citService.parseSpan(citation, 'dc')
          : this._citService.parse(citation, 'dc')) || undefined
      );
    },
  );

  // the draft is rebuilt from each new bound item
  private readonly _draft = linkedSignal(() => toDraft(this.item()));
  public readonly form = form(this._draft, (p) => {
    required(p.eid);
    maxLength(p.eid, 100);
    required(p.type);
    maxLength(p.type, 100);
    maxLength(p.citation, 1000);
  });

  constructor() {
    // when the draft mirrors the bound item, there are no unsaved edits
    effect(() => {
      const draft = this._draft();
      untracked(() => {
        if (this.isDraftInSync(draft)) {
          this.form().reset();
        }
      });
    });
  }

  /** True when the draft still mirrors the bound item. */
  private isDraftInSync(draft: FigPlanItemControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.item()));
  }

  public onCitationChange(citation: Citation | CitationSpan | undefined): void {
    let text = '';
    if (citation) {
      if ((citation as CitationSpan)?.a) {
        const span = citation as CitationSpan;
        text = `${this._citService.toString(span.a)} - ${this._citService.toString(
          span.b || span.a,
        )}`;
      } else {
        text = this._citService.toString(citation as Citation);
      }
    }
    setFieldFromChild(this.form.citation, text);
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
   * Saves the current form data by updating the `item` model signal.
   * @param pristine If true (default), the form's interaction state is
   * cleared after saving.
   */
  public save(pristine = true): void {
    if (this.form().invalid()) {
      // show validation errors
      this.form().markAsTouched();
      return;
    }

    this.item.set(toModel(this._draft()));

    if (pristine) {
      this.form().reset();
    }
  }
}
