import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
} from '@angular/core';
import { FormField, maxLength, min, required } from '@angular/forms/signals';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  copyFormValue,
  HelpLinkComponent,
  ModelEditorComponentBase,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { PhysicalDimension } from '@myrmidon/cadmus-mat-physical-size';
import {
  DecoratedCount,
  DecoratedCountsComponent,
} from '@myrmidon/cadmus-refs-decorated-counts';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import {
  CodLayoutFormulaComponent,
  CodLayoutFormulaWithDimensions,
} from '@myrmidon/cadmus-codicology-ui';

import {
  COD_FR_LAYOUT_PART_TYPEID,
  CodFrLayoutPart,
} from '../cod-fr-layout-part';

const DEFAULT_UNITS = [
  { id: 'mm', value: 'mm' },
  { id: 'cm', value: 'cm' },
];

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface CodFrLayoutPartControls {
  formula: string;
  dimensions: PhysicalDimension[];
  pricking: string;
  columnCount: number | null;
  features: string[];
  counts: DecoratedCount[];
  note: string;
}

function toDraft(part?: CodFrLayoutPart | null): CodFrLayoutPartControls {
  return {
    formula: part?.formula || '',
    dimensions: copyFormValue(part?.dimensions || []),
    pricking: part?.pricking || '',
    columnCount: part?.columnCount || 0,
    features: [...(part?.features || [])],
    counts: copyFormValue(part?.counts || []),
    note: part?.note || '',
  };
}

function toFormulaData(
  part?: CodFrLayoutPart | null,
): CodLayoutFormulaWithDimensions {
  return {
    prefix: (part?.formula?.split(' ')[0] as 'IT' | 'BO') || 'BO',
    formula: part?.formula || '',
    dimensions: copyFormValue(part?.dimensions || []),
  };
}

/**
 * CodFrLayout part editor component.
 * Thesauri: cod-fr-layout-prickings, decorated-count-ids,
 * cod-fr-layout-features, decorated-count-tags, physical-size-units,
 * physical-size-dim-tags.
 */
@Component({
  selector: 'cadmus-cod-fr-layout-part',
  imports: [
    FormField,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    FlagSetComponent,
    CodLayoutFormulaComponent,
    DecoratedCountsComponent,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
  templateUrl: './cod-fr-layout-part.component.html',
  styleUrl: './cod-fr-layout-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodFrLayoutPartComponent extends ModelEditorComponentBase<CodFrLayoutPart> {
  // the data of the formula editor: derived from the bound part, and replaced
  // by what the formula editor emits, so that it is not reset by its own changes
  public readonly formulaData = linkedSignal<CodLayoutFormulaWithDimensions>(
    () => toFormulaData(this.data()?.value),
  );

  // cod-fr-layout-features
  public readonly featureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-layout-features']?.entries,
  );
  // cod-fr-layout-prickings
  public readonly prickingEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-layout-prickings']?.entries,
  );
  // decorated-count-ids
  public readonly countIdEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['decorated-count-ids']?.entries,
  );
  // decorated-count-tags
  public readonly countTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['decorated-count-tags']?.entries,
  );
  // physical-size-units
  public readonly unitEntries = computed<ThesaurusEntry[]>(
    () =>
      this.data()?.thesauri?.['physical-size-units']?.entries || DEFAULT_UNITS,
  );
  // physical-size-dim-tags
  public readonly dimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-dim-tags']?.entries,
  );

  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    required(p.formula);
    maxLength(p.pricking, 100);
    min(p.columnCount, 1);
    maxLength(p.note, 1000);
  });

  protected getValue(): CodFrLayoutPart {
    const part = this.getEditedPart(
      COD_FR_LAYOUT_PART_TYPEID,
    ) as CodFrLayoutPart;
    const draft = this._draft();
    part.formula = draft.formula.trim();
    part.dimensions = draft.dimensions.length
      ? copyFormValue(draft.dimensions)
      : undefined;
    part.pricking = draft.pricking.trim() || undefined;
    part.columnCount = draft.columnCount || 0;
    part.features = draft.features.length ? [...draft.features] : undefined;
    part.counts = draft.counts.length ? copyFormValue(draft.counts) : undefined;
    part.note = draft.note.trim() || undefined;
    return part;
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  public onCountsChange(counts: DecoratedCount[]): void {
    setFieldFromChild(this.form.counts, copyFormValue(counts || []));
  }

  public onFormulaDataChange(data: CodLayoutFormulaWithDimensions): void {
    this.formulaData.set(data);
    setFieldFromChild(this.form.formula, data.formula || '');
    setFieldFromChild(
      this.form.dimensions,
      copyFormValue(data.dimensions || []),
    );
  }
}
