import { Component, computed, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  ThesauriSet,
  ThesaurusEntry,
  EditedObject,
} from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
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

/**
 * CodFrLayout part editor component.
 * Thesauri: cod-fr-layout-prickings, decorated-count-ids,
 * cod-fr-layout-features, decorated-count-tags, physical-size-units,
 * physical-size-dim-tags.
 */
@Component({
  selector: 'cadmus-cod-fr-layout-part',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  ],
  templateUrl: './cod-fr-layout-part.component.html',
  styleUrl: './cod-fr-layout-part.component.css',
})
export class CodFrLayoutPartComponent
  extends ModelEditorComponentBase<CodFrLayoutPart>
  implements OnInit
{
  public formula: FormControl<string>;
  public dimensions: FormControl<PhysicalDimension[]>;
  public pricking: FormControl<string>;
  public columnCount: FormControl<number>;
  public features: FormControl<string[]>;
  public counts: FormControl<DecoratedCount[]>;
  public note: FormControl<string | null>;

  public readonly formulaData = signal<CodLayoutFormulaWithDimensions>({
    prefix: 'BO',
    formula: '',
    dimensions: [],
  });

  // cod-fr-layout-features
  public featureEntries?: ThesaurusEntry[];
  // cod-fr-layout-prickings
  public prickingEntries?: ThesaurusEntry[];
  // decorated-count-ids
  public countIdEntries?: ThesaurusEntry[];
  // decorated-count-tags
  public countTagEntries?: ThesaurusEntry[];
  // physical-size-units
  public unitEntries: ThesaurusEntry[] = DEFAULT_UNITS;
  // physical-size-dim-tags
  public dimTagEntries?: ThesaurusEntry[];

  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries?.map((e) => entryToFlag(e)) || []
  );

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.formula = formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    });
    this.dimensions = formBuilder.control<PhysicalDimension[]>([], {
      nonNullable: true,
    });
    this.pricking = formBuilder.control<string>(
      this.prickingEntries?.[0]?.id || '',
      {
        validators: Validators.maxLength(100),
        nonNullable: true,
      }
    );
    this.features = formBuilder.control([], { nonNullable: true });
    this.columnCount = formBuilder.control<number>(0, {
      validators: Validators.min(1),
      nonNullable: true,
    });
    this.counts = formBuilder.control<DecoratedCount[]>([], {
      nonNullable: true,
    });
    this.note = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(1000),
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      formula: this.formula,
      dimensions: this.dimensions,
      pricking: this.pricking,
      columnCount: this.columnCount,
      counts: this.counts,
      note: this.note,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-fr-layout-prickings';
    if (this.hasThesaurus(key)) {
      this.prickingEntries = thesauri[key].entries;
    } else {
      this.prickingEntries = undefined;
    }
    key = 'decorated-count-ids';
    if (this.hasThesaurus(key)) {
      this.countIdEntries = thesauri[key].entries;
    } else {
      this.countIdEntries = undefined;
    }
    key = 'decorated-count-tags';
    if (this.hasThesaurus(key)) {
      this.countTagEntries = thesauri[key].entries;
    } else {
      this.countTagEntries = undefined;
    }
    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.unitEntries = thesauri[key].entries || DEFAULT_UNITS;
    } else {
      this.unitEntries = DEFAULT_UNITS;
    }
    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.dimTagEntries = thesauri[key].entries;
    } else {
      this.dimTagEntries = undefined;
    }
  }

  private updateForm(part?: CodFrLayoutPart | null): void {
    if (!part) {
      this.form.reset();
      this.formulaData.set({
        prefix: 'BO',
        formula: '',
        dimensions: [],
      });
      return;
    }

    this.formula.setValue(part.formula || '');
    this.dimensions.setValue(part.dimensions || []);
    this.pricking.setValue(part.pricking || '');
    this.columnCount.setValue(part.columnCount || 0);
    this.features.setValue(part.features || []);
    this.counts.setValue(part.counts || []);
    this.note.setValue(part.note || null);

    this.formulaData.set({
      prefix: (part.formula?.split(' ')[0] as 'IT' | 'BO') || 'BO',
      formula: part.formula || '',
      dimensions: part.dimensions || [],
    });

    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodFrLayoutPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodFrLayoutPart {
    let part = this.getEditedPart(COD_FR_LAYOUT_PART_TYPEID) as CodFrLayoutPart;
    part.formula = this.formula.value.trim();
    part.dimensions = this.dimensions.value?.length
      ? this.dimensions.value
      : undefined;
    part.pricking = this.pricking.value?.trim() || undefined;
    part.columnCount = this.columnCount.value || 0;
    part.features = this.features.value?.length
      ? this.features.value
      : undefined;
    part.counts = this.counts.value?.length ? this.counts.value : undefined;
    part.note = this.note.value?.trim() || undefined;
    return part;
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onCountsChange(counts: DecoratedCount[]): void {
    this.counts.setValue(counts);
    this.counts.markAsDirty();
    this.counts.updateValueAndValidity();
  }

  public onFormulaDataChange(data: CodLayoutFormulaWithDimensions): void {
    this.formulaData.set(data);

    this.formula.setValue(data.formula);
    this.formula.markAsDirty();
    this.formula.updateValueAndValidity();
  }
}
