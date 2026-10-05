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

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import {
  CodLocationComponent,
  CodLocationParser,
  CodLocationRange,
} from '@myrmidon/cadmus-cod-location';
import {
  Citation,
  CitationSpan,
  CitSchemeService,
  CompactCitationComponent,
} from '@myrmidon/cadmus-refs-citation';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';
import {
  copyFormValue,
  isImplicitSubmission,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import { FigPlanImplItem, FigPlanItemLabel } from '../print-fig-plan-impl-part';
import { FigPlanItemLabelEditorComponent } from '../fig-plan-item-label-editor/fig-plan-item-label-editor.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * The editable draft behind the form.
 */
interface FigPlanImplItemControls {
  eid: string;
  type: string;
  citation: string;
  location: CodLocationRange[];
  position: string;
  changeType: string;
  iconographyId: AssertedCompositeId | null;
  features: string[];
  size: PhysicalSize | null;
  matrixType: string;
  matrixState: string;
  matrixStateDsc: string;
  labels: FigPlanItemLabel[];
}

/**
 * Item -> draft.
 */
function toDraft(item?: FigPlanImplItem | null): FigPlanImplItemControls {
  const location = CodLocationParser.parseLocation(item?.location);
  return {
    eid: item?.eid || '',
    type: item?.type || '',
    citation: item?.citation || '',
    location: location ? [{ start: location, end: location }] : [],
    position: item?.position || '',
    changeType: item?.changeType || '',
    iconographyId: item?.iconographyId
      ? copyFormValue(item.iconographyId)
      : null,
    features: [...(item?.features || [])],
    size: item?.size ? copyFormValue(item.size) : null,
    matrixType: item?.matrixType || '',
    matrixState: item?.matrixState || '',
    matrixStateDsc: item?.matrixStateDsc || '',
    labels: copyFormValue(item?.labels || []),
  };
}

/**
 * Draft -> item.
 */
function toModel(draft: FigPlanImplItemControls): FigPlanImplItem {
  return {
    eid: draft.eid.trim(),
    type: draft.type.trim(),
    citation: draft.citation.trim() || undefined,
    location: draft.location.length
      ? CodLocationParser.locationToString(draft.location[0].start)!
      : undefined,
    position: draft.position.trim() || undefined,
    changeType: draft.changeType.trim() || undefined,
    iconographyId: draft.iconographyId
      ? copyFormValue(draft.iconographyId)
      : undefined,
    features: draft.features.length ? [...draft.features] : undefined,
    size: draft.size ? copyFormValue(draft.size) : undefined,
    matrixType: draft.matrixType.trim() || undefined,
    matrixState: draft.matrixState.trim() || undefined,
    matrixStateDsc: draft.matrixStateDsc.trim() || undefined,
    labels: draft.labels.length ? copyFormValue(draft.labels) : undefined,
  };
}

/**
 * Editor for a figurative plan's implementation item.
 */
@Component({
  selector: 'cadmus-fig-plan-impl-item-editor',
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    CodLocationComponent,
    CompactCitationComponent,
    AssertedCompositeIdComponent,
    FlagSetComponent,
    PhysicalSizeComponent,
    FigPlanItemLabelEditorComponent,
  ],
  templateUrl: './fig-plan-impl-item-editor.component.html',
  styleUrl: './fig-plan-impl-item-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FigPlanImplItemEditorComponent {
  private readonly _citService = inject(CitSchemeService);
  private readonly _dialogService = inject(DialogService);

  public readonly item = model<FigPlanImplItem | undefined>();
  public readonly cancelEdit = output();

  // fig-plan-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-positions
  public readonly positionEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-change-types
  public readonly changeTypeEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-item-features
  public readonly featureEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-matrix-types
  public readonly matrixTypeEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-matrix-states
  public readonly matrixStateEntries = input<ThesaurusEntry[]>();

  // asserted-id-scopes
  public readonly assIdScopeEntries = input<ThesaurusEntry[]>();
  // asserted-id-tags
  public readonly assIdTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  // physical-size-units
  public readonly szUnitEntries = input<ThesaurusEntry[]>();
  // physical-size-tags
  public readonly szTagEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public readonly szDimTagEntries = input<ThesaurusEntry[]>();

  // fig-plan-item-label-types
  public readonly labelTypeEntries = input<ThesaurusEntry[]>();
  // fig-plan-item-label-languages
  public readonly labelLangEntries = input<ThesaurusEntry[]>();

  // print-font-families
  public readonly fontFamilyEntries = input<ThesaurusEntry[]>();
  // print-layout-sections
  public readonly layoutSectionEntries = input<ThesaurusEntry[]>();
  // print-font-features
  public readonly fontFeatureEntries = input<ThesaurusEntry[]>();
  // asserted-id-features
  public readonly idFeatureEntries = input<ThesaurusEntry[]>();

  public readonly lookupProviderOptions = input<
    LookupProviderOptions | undefined
  >();

  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );

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
  // the edited label
  public readonly editedLabel = signal<FigPlanItemLabel | undefined>(undefined);
  // the edited label index
  public readonly editedLabelIndex = signal<number>(-1);

  // the draft is rebuilt from each new bound item
  private readonly _draft = linkedSignal(() => toDraft(this.item()));
  public readonly form = form(this._draft, (p) => {
    required(p.eid);
    maxLength(p.eid, 100);
    required(p.type);
    maxLength(p.type, 100);
    maxLength(p.citation, 1000);
    maxLength(p.position, 100);
    maxLength(p.changeType, 100);
    maxLength(p.matrixType, 100);
    maxLength(p.matrixState, 100);
    maxLength(p.matrixStateDsc, 1000);
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
  private isDraftInSync(draft: FigPlanImplItemControls): boolean {
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

  public onLocationChange(location: CodLocationRange[]): void {
    setFieldFromChild(this.form.location, copyFormValue(location || []));
  }

  public onIdChange(id: AssertedCompositeId | null): void {
    setFieldFromChild(this.form.iconographyId, id || null);
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  public onSizeChange(size: PhysicalSize): void {
    setFieldFromChild(this.form.size, size || null);
  }

  //#region labels
  public addLabel(): void {
    const label: FigPlanItemLabel = {
      type: this.labelTypeEntries()?.[0].id || '',
    };
    this.editLabel(label, -1);
  }

  public editLabel(label: FigPlanItemLabel, index: number): void {
    this.editedLabelIndex.set(index);
    // structuredClone also drops the form's Symbol tag
    this.editedLabel.set(structuredClone(label));
  }

  public closeLabel(): void {
    this.editedLabelIndex.set(-1);
    this.editedLabel.set(undefined);
  }

  public saveLabel(label: FigPlanItemLabel): void {
    const entries = [...this.form.labels().value()];
    if (this.editedLabelIndex() === -1) {
      entries.push(label);
    } else {
      entries.splice(this.editedLabelIndex(), 1, label);
    }
    this.form.labels().value.set(entries);
    this.form.labels().markAsDirty();
    this.closeLabel();
  }

  public deleteLabel(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Label?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedLabelIndex() === index) {
            this.closeLabel();
          }
          const entries = [...this.form.labels().value()];
          entries.splice(index, 1);
          this.form.labels().value.set(entries);
          this.form.labels().markAsDirty();
        }
      });
  }

  public moveLabelUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entries = [...this.form.labels().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.form.labels().value.set(entries);
    this.form.labels().markAsDirty();
    // keep editedLabelIndex in sync
    if (this.editedLabelIndex() === index) {
      this.editedLabelIndex.set(index - 1);
    } else if (this.editedLabelIndex() === index - 1) {
      this.editedLabelIndex.set(index);
    }
  }

  public moveLabelDown(index: number): void {
    if (index + 1 >= this.form.labels().value().length) {
      return;
    }
    const entries = [...this.form.labels().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.form.labels().value.set(entries);
    this.form.labels().markAsDirty();
    // keep editedLabelIndex in sync
    if (this.editedLabelIndex() === index) {
      this.editedLabelIndex.set(index + 1);
    } else if (this.editedLabelIndex() === index + 1) {
      this.editedLabelIndex.set(index);
    }
  }
  //#endregion

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
