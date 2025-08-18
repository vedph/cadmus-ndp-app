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
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  EditedObject,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';

import {
  PRINT_FIG_PLAN_PART_TYPEID,
  PrintFigPlanPart,
} from '../print-fig-plan-part';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * PrintFigPlan part editor component.
 * Thesauri: fig-plan-techniques, fig-plan-types, fig-plan-features,
 * asserted-id-scopes, asserted-id-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags.
 */
@Component({
  selector: 'cadmus-print-fig-plan-part',
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
    // cadmus
    CloseSaveButtonsComponent,
    AssertedCompositeIdsComponent,
    FlagSetComponent,
    MatTabGroup,
    MatTab,
  ],
  templateUrl: './print-fig-plan-part.component.html',
  styleUrl: './print-fig-plan-part.component.css',
})
export class PrintFigPlanPartComponent
  extends ModelEditorComponentBase<PrintFigPlanPart>
  implements OnInit
{
  public artistIds: FormControl<AssertedCompositeId[]>;
  public techniques: FormControl<string[]>;
  public features: FormControl<string[]>;
  public description: FormControl<string | null>;
  // TODO

  // fig-plan-techniques
  public readonly planTechEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-types
  public readonly planTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-features
  public readonly planFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // asserted-id-scopes
  public readonly assIdScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // asserted-id-tags
  public readonly assIdTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // doc-reference-types
  public readonly docRefTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // doc-reference-tags
  public readonly docRefTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // flags mapped from thesaurus entries
  public techFlags = computed<Flag[]>(
    () => this.planTechEntries()?.map((e) => entryToFlag(e)) || []
  );
  public featureFlags = computed<Flag[]>(
    () => this.planFeatureEntries()?.map((e) => entryToFlag(e)) || []
  );

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    this.artistIds = formBuilder.control<AssertedCompositeId[]>([], {
      nonNullable: true,
    });
    this.techniques = formBuilder.control<string[]>([], { nonNullable: true });
    this.features = formBuilder.control<string[]>([], { nonNullable: true });
    this.description = formBuilder.control<string | null>(null, {
      validators: Validators.maxLength(1000),
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      artistIds: this.artistIds.value?.length
        ? this.artistIds.value
        : undefined,
      techniques: this.techniques.value?.length
        ? this.techniques.value
        : undefined,
      features: this.features.value?.length ? this.features.value : undefined,
      description: this.description.value?.trim() || undefined,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'fig-plan-techniques';
    if (this.hasThesaurus(key)) {
      this.planTechEntries.set(thesauri[key].entries);
    } else {
      this.planTechEntries.set(undefined);
    }
    key = 'fig-plan-types';
    if (this.hasThesaurus(key)) {
      this.planTypeEntries.set(thesauri[key].entries);
    } else {
      this.planTypeEntries.set(undefined);
    }
    key = 'fig-plan-features';
    if (this.hasThesaurus(key)) {
      this.planFeatureEntries.set(thesauri[key].entries);
    } else {
      this.planFeatureEntries.set(undefined);
    }
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.assIdScopeEntries.set(thesauri[key].entries);
    } else {
      this.assIdScopeEntries.set(undefined);
    }
    key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.assIdTagEntries.set(thesauri[key].entries);
    } else {
      this.assIdTagEntries.set(undefined);
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.docRefTypeEntries.set(thesauri[key].entries);
    } else {
      this.docRefTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.docRefTagEntries.set(thesauri[key].entries);
    } else {
      this.docRefTagEntries.set(undefined);
    }
  }

  private updateForm(part?: PrintFigPlanPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }

    this.artistIds.setValue(part.artistIds ?? [], { emitEvent: false });
    this.techniques.setValue(part.techniques ?? [], { emitEvent: false });
    this.features.setValue(part.features ?? [], { emitEvent: false });
    this.description.setValue(part.description ?? null, { emitEvent: false });

    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<PrintFigPlanPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  public onTechniqueCheckedIdsChange(ids: string[]): void {
    this.techniques.setValue(ids);
    this.techniques.markAsDirty();
    this.techniques.updateValueAndValidity();
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onArtistIdsChange(ids: AssertedCompositeId[]): void {
    this.artistIds.setValue(ids);
    this.artistIds.markAsDirty();
    this.artistIds.updateValueAndValidity();
  }

  protected getValue(): PrintFigPlanPart {
    let part = this.getEditedPart(
      PRINT_FIG_PLAN_PART_TYPEID
    ) as PrintFigPlanPart;

    part.artistIds = this.artistIds.value?.length
      ? this.artistIds.value
      : undefined;
    part.techniques = this.techniques.value || [];
    part.features = this.features.value?.length
      ? this.features.value
      : undefined;
    part.description = this.description.value?.trim() || undefined;
    return part;
  }
}
