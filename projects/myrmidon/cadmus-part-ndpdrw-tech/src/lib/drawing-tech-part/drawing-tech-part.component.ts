import { Component, computed, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { PhysicalMeasurement, PhysicalMeasurementSetComponent } from '@myrmidon/cadmus-mat-physical-size';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';

import {
  EditedObject,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
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

/**
 * Drawing techniques part editor component.
 * Thesauri: drawing-tech-materials, drawing-tech-features, drawing-tech-techniques,
 * drawing-tech-colors, drawing-tech-size-units, drawing-tech-dim-tags,
 * drawing-tech-measure-names.
 */
@Component({
  selector: 'cadmus-drawing-tech-part',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
],
  templateUrl: './drawing-tech-part.component.html',
  styleUrl: './drawing-tech-part.component.css',
})
export class DrawingTechPartComponent
  extends ModelEditorComponentBase<DrawingTechPart>
  implements OnInit
{
  public material: FormControl<string>;
  public features: FormControl<string[]>;
  public measures: FormControl<PhysicalMeasurement[]>;
  public techniques: FormControl<string[]>;
  public colors: FormControl<string[]>;
  public note: FormControl<string | null>;

  // drawing-tech-materials
  public readonly materialEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // drawing-tech-features
  public readonly featureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // drawing-tech-techniques
  public readonly techniqueEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // drawing-tech-colors
  public readonly colorEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // drawing-tech-size-units
  public readonly sizeUnitEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // drawing-tech-dim-tags
  public readonly dimTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // drawing-tech-measure-names
  public readonly measureNameEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || []
  );
  public techniqueFlags = computed<Flag[]>(
    () => this.techniqueEntries()?.map((e) => entryToFlag(e)) || []
  );
  public colorFlags = computed<Flag[]>(
    () => this.colorEntries()?.map((e) => entryToFlag(e)) || []
  );

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.material = formBuilder.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    });
    this.features = formBuilder.control([], { nonNullable: true });
    this.measures = formBuilder.control([], { nonNullable: true });
    this.techniques = formBuilder.control([], { nonNullable: true });
    this.colors = formBuilder.control([], { nonNullable: true });
    this.note = formBuilder.control(null, {
      validators: [Validators.maxLength(5000)],
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      material: this.material,
      features: this.features,
      measures: this.measures,
      techniques: this.techniques,
      colors: this.colors,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'drawing-tech-materials';
    if (this.hasThesaurus(key)) {
      this.materialEntries.set(thesauri[key].entries);
    } else {
      this.materialEntries.set(undefined);
    }
    key = 'drawing-tech-features';
    if (this.hasThesaurus(key)) {
      this.featureEntries.set(thesauri[key].entries);
    } else {
      this.featureEntries.set(undefined);
    }
    key = 'drawing-tech-techniques';
    if (this.hasThesaurus(key)) {
      this.techniqueEntries.set(thesauri[key].entries);
    } else {
      this.techniqueEntries.set(undefined);
    }
    key = 'drawing-tech-colors';
    if (this.hasThesaurus(key)) {
      this.colorEntries.set(thesauri[key].entries);
    } else {
      this.colorEntries.set(undefined);
    }
    key = 'drawing-tech-size-units';
    if (this.hasThesaurus(key)) {
      this.sizeUnitEntries.set(thesauri[key].entries);
    } else {
      this.sizeUnitEntries.set(undefined);
    }
    key = 'drawing-tech-dim-tags';
    if (this.hasThesaurus(key)) {
      this.dimTagEntries.set(thesauri[key].entries);
    } else {
      this.dimTagEntries.set(undefined);
    }
    key = 'drawing-tech-measure-names';
    if (this.hasThesaurus(key)) {
      this.measureNameEntries.set(thesauri[key].entries);
    } else {
      this.measureNameEntries.set(undefined);
    }
  }

  private updateForm(part?: DrawingTechPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.material.setValue(part.material);
    this.features.setValue(part.features || []);
    this.measures.setValue(part.measures || []);
    this.techniques.setValue(part.techniques || []);
    this.colors.setValue(part.colors || []);
    this.note.setValue(part.note || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<DrawingTechPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): DrawingTechPart {
    let part = this.getEditedPart(DRAWING_TECH_PART_TYPEID) as DrawingTechPart;
    part.material = this.material.value || '';
    part.features = this.features.value?.length
      ? this.features.value
      : undefined;
    part.measures = this.measures.value?.length
      ? this.measures.value
      : undefined;
    part.techniques = this.techniques.value?.length
      ? this.techniques.value
      : undefined;
    part.colors = this.colors.value?.length ? this.colors.value : undefined;
    part.note = this.note.value?.trim() || undefined;
    return part;
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onTechniqueCheckedIdsChange(ids: string[]): void {
    this.techniques.setValue(ids);
    this.techniques.markAsDirty();
    this.techniques.updateValueAndValidity();
  }

  public onColorCheckedIdsChange(ids: string[]): void {
    this.colors.setValue(ids);
    this.colors.markAsDirty();
    this.colors.updateValueAndValidity();
  }

  public onMeasuresChange(measures: PhysicalMeasurement[]): void {
    this.measures.setValue(measures);
    this.measures.markAsDirty();
    this.measures.updateValueAndValidity();
  }
}
