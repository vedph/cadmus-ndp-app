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
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { FlatLookupPipe, NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  PrintFont,
  PrintFontEditorComponent,
} from '@myrmidon/cadmus-part-ndpbooks-fonts';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import { MatExpansionModule } from '@angular/material/expansion';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { FigPlanItemLabel } from '../print-fig-plan-impl-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * The editable draft behind the form.
 */
interface FigPlanItemLabelControls {
  type: string;
  languages: string[];
  value: string;
  note: string;
  fonts: PrintFont[];
}

/**
 * Label -> draft.
 */
function toDraft(label?: FigPlanItemLabel | null): FigPlanItemLabelControls {
  return {
    type: label?.type || '',
    languages: [...(label?.languages || [])],
    value: label?.value || '',
    note: label?.note || '',
    fonts: copyFormValue(label?.fonts || []),
  };
}

/**
 * Draft -> label.
 */
function toModel(draft: FigPlanItemLabelControls): FigPlanItemLabel {
  return {
    type: draft.type.trim(),
    languages: [...draft.languages],
    value: draft.value.trim() || undefined,
    note: draft.note.trim() || undefined,
    fonts: draft.fonts.length ? copyFormValue(draft.fonts) : undefined,
  };
}

/**
 * Editor for a figurative plan item's label.
 */
@Component({
  selector: 'cadmus-fig-plan-item-label-editor',
  imports: [
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FlagSetComponent,
    PrintFontEditorComponent,
    FlatLookupPipe,
  ],
  templateUrl: './fig-plan-item-label-editor.component.html',
  styleUrl: './fig-plan-item-label-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FigPlanItemLabelEditorComponent {
  private readonly _dialogService = inject(DialogService);

  public readonly label = model<FigPlanItemLabel | undefined>();
  public readonly cancelEdit = output();
  // fig-plan-item-label-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // fig-plan-item-label-languages
  public readonly languageEntries = input<ThesaurusEntry[]>();
  // asserted-id-scopes
  public readonly assIdScopeEntries = input<ThesaurusEntry[]>();
  // asserted-id-tags
  public readonly assIdTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly docRefTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly docRefTagEntries = input<ThesaurusEntry[]>();

  // print-font-families
  public readonly fontFamilyEntries = input<ThesaurusEntry[]>();
  // print-layout-sections
  public readonly layoutSectionEntries = input<ThesaurusEntry[]>();
  // print-font-features
  public readonly fontFeatureEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  public readonly languageFlags = computed<Flag[]>(
    () => this.languageEntries()?.map((e) => entryToFlag(e)) || [],
  );

  public readonly edited = signal<PrintFont | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  // the draft is rebuilt from each new bound label
  private readonly _draft = linkedSignal(() => toDraft(this.label()));
  public readonly form = form(this._draft, (p) => {
    required(p.type);
    maxLength(p.type, 100);
    maxLength(p.languages, 100);
    maxLength(p.value, 500);
    maxLength(p.note, 1000);
    // at least 1 font
    NgxToolsSignalValidators.strictMinLength(p.fonts, 1);
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
  private isDraftInSync(draft: FigPlanItemLabelControls): boolean {
    return JSON.stringify(draft) === JSON.stringify(toDraft(this.label()));
  }

  public addFont(): void {
    const font: PrintFont = {
      family: '',
    };
    this.editFont(font, -1);
  }

  public editFont(font: PrintFont, index: number): void {
    this.editedIndex.set(index);
    // structuredClone also drops the form's Symbol tag
    this.edited.set(structuredClone(font));
  }

  public closeFont(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveFont(entry: PrintFont): void {
    const fonts = [...this.form.fonts().value()];
    if (this.editedIndex() === -1) {
      fonts.push(entry);
    } else {
      fonts.splice(this.editedIndex(), 1, entry);
    }
    this.form.fonts().value.set(fonts);
    this.form.fonts().markAsDirty();
    this.closeFont();
  }

  public deleteFont(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Font?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeFont();
          }
          const fonts = [...this.form.fonts().value()];
          fonts.splice(index, 1);
          this.form.fonts().value.set(fonts);
          this.form.fonts().markAsDirty();
        }
      });
  }

  public moveFontUp(index: number): void {
    if (index < 1) {
      return;
    }
    const fonts = [...this.form.fonts().value()];
    const font = fonts[index];
    fonts.splice(index, 1);
    fonts.splice(index - 1, 0, font);
    this.form.fonts().value.set(fonts);
    this.form.fonts().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
    }
  }

  public moveFontDown(index: number): void {
    if (index + 1 >= this.form.fonts().value().length) {
      return;
    }
    const fonts = [...this.form.fonts().value()];
    const font = fonts[index];
    fonts.splice(index, 1);
    fonts.splice(index + 1, 0, font);
    this.form.fonts().value.set(fonts);
    this.form.fonts().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index + 1);
    } else if (this.editedIndex() === index + 1) {
      this.editedIndex.set(index);
    }
  }

  public onLanguageIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.languages, [...(ids || [])]);
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
