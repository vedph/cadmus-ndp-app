import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
} from '@angular/core';
import { FormField, maxLength, required } from '@angular/forms/signals';

import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  PhysicalMeasurement,
  PhysicalMeasurementSetComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  copyFormValue,
  HelpLinkComponent,
  ModelEditorComponentBase,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import {
  DRAWING_TECH_PART_TYPEID,
  DrawingTechPart,
} from '../drawing-tech-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface DrawingTechPartControls {
  material: string;
  features: string[];
  measures: PhysicalMeasurement[];
  techniques: string[];
  colors: string[];
  note: string;
}

function toDraft(part?: DrawingTechPart | null): DrawingTechPartControls {
  return {
    material: part?.material || '',
    features: [...(part?.features || [])],
    measures: copyFormValue(part?.measures || []),
    techniques: [...(part?.techniques || [])],
    colors: [...(part?.colors || [])],
    note: part?.note || '',
  };
}

/**
 * Drawing techniques part editor component.
 * Thesauri: drawing-tech-materials, drawing-tech-features, drawing-tech-techniques,
 * drawing-tech-colors, drawing-tech-size-units, drawing-tech-dim-tags,
 * drawing-tech-measure-names.
 */
@Component({
  selector: 'cadmus-drawing-tech-part',
  imports: [
    FormField,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TitleCasePipe,
    // cadmus
    FlagSetComponent,
    CloseSaveButtonsComponent,
    PhysicalMeasurementSetComponent,
    HelpLinkComponent,
  ],
  templateUrl: './drawing-tech-part.component.html',
  styleUrl: './drawing-tech-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawingTechPartComponent extends ModelEditorComponentBase<DrawingTechPart> {
  // drawing-tech-materials
  public readonly materialEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['drawing-tech-materials']?.entries,
  );
  // drawing-tech-features
  public readonly featureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['drawing-tech-features']?.entries,
  );
  // drawing-tech-techniques
  public readonly techniqueEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['drawing-tech-techniques']?.entries,
  );
  // drawing-tech-colors
  public readonly colorEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['drawing-tech-colors']?.entries,
  );
  // drawing-tech-size-units
  public readonly sizeUnitEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['drawing-tech-size-units']?.entries,
  );
  // drawing-tech-dim-tags
  public readonly dimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['drawing-tech-dim-tags']?.entries,
  );
  // drawing-tech-measure-names
  public readonly measureNameEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['drawing-tech-measure-names']?.entries,
  );

  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );
  public techniqueFlags = computed<Flag[]>(
    () => this.techniqueEntries()?.map((e) => entryToFlag(e)) || [],
  );
  public colorFlags = computed<Flag[]>(
    () => this.colorEntries()?.map((e) => entryToFlag(e)) || [],
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    required(p.material);
    maxLength(p.material, 50);
    maxLength(p.note, 5000);
  });

  protected getValue(): DrawingTechPart {
    const part = this.getEditedPart(
      DRAWING_TECH_PART_TYPEID,
    ) as DrawingTechPart;
    const draft = this._draft();
    part.material = draft.material.trim();
    part.features = draft.features.length ? [...draft.features] : undefined;
    part.measures = draft.measures.length
      ? copyFormValue(draft.measures)
      : undefined;
    part.techniques = draft.techniques.length
      ? [...draft.techniques]
      : undefined;
    part.colors = draft.colors.length ? [...draft.colors] : undefined;
    part.note = draft.note.trim() || undefined;
    return part;
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  public onTechniqueCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.techniques, [...(ids || [])]);
  }

  public onColorCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.colors, [...(ids || [])]);
  }

  public onMeasuresChange(measures: PhysicalMeasurement[]): void {
    setFieldFromChild(this.form.measures, copyFormValue(measures || []));
  }
}
