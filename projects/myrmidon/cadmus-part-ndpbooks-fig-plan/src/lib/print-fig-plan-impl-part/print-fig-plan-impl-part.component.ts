import { Component, computed, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import {
  EditedObject,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';

import {
  FigPlanImplItem,
  PrintFigPlanImplPart,
} from '../print-fig-plan-impl-part';
import { PRINT_FIG_PLAN_PART_TYPEID } from '../print-fig-plan-part';
import { FigPlanImplItemEditorComponent } from '../fig-plan-impl-item-editor/fig-plan-impl-item-editor.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

/**
 * PrintFigPlanImplPart editor component.
 * Thesauri: fig-plan-types, fig-plan-impl-positions, fig-plan-impl-change-types,
 * fig-plan-impl-item-features, fig-plan-impl-matrix-types, fig-plan-impl-matrix-states,
 * asserted-id-scopes, asserted-id-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags, physical-size-units, physical-size-tags, physical-size-dim-tags,
 * fig-plan-item-label-types, fig-plan-item-label-languages, print-font-families,
 * print-layout-sections, print-font-features.
 */
@Component({
  selector: 'cadmus-print-fig-plan-impl-part',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    FlatLookupPipe,
    FlagSetComponent,
    CloseSaveButtonsComponent,
    FigPlanImplItemEditorComponent,
  ],
  templateUrl: './print-fig-plan-impl-part.component.html',
  styleUrl: './print-fig-plan-impl-part.component.css',
})
export class PrintFigPlanImplPartComponent
  extends ModelEditorComponentBase<PrintFigPlanImplPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<FigPlanImplItem | undefined>(undefined);

  // fig-plan-techniques
  public readonly techniqueEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-impl-features
  public readonly featureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // fig-plan-types
  public readonly typeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // fig-plan-impl-positions
  public readonly positionEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-impl-change-types
  public readonly changeTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-impl-item-features
  public readonly itemFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-impl-matrix-types
  public readonly matrixTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-impl-matrix-states
  public readonly matrixStateEntries = signal<ThesaurusEntry[] | undefined>(
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
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // physical-size-units
  public readonly szUnitEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // physical-size-tags
  public readonly szTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // physical-size-dim-tags
  public readonly szDimTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // fig-plan-item-label-types
  public readonly labelTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // fig-plan-item-label-languages
  public readonly labelLangEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // print-font-families
  public readonly fontFamilyEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // print-layout-sections
  public readonly layoutSectionEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );
  // print-font-features
  public readonly fontFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined
  );

  // flags mapped from thesaurus entries
  public techniqueFlags = computed<Flag[]>(
    () => this.techniqueEntries()?.map((e) => entryToFlag(e)) || []
  );
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || []
  );

  public complete: FormControl<boolean>;
  public techniques: FormControl<string[]>;
  public features: FormControl<string[]>;
  public description: FormControl<string | null>;
  public items: FormControl<FigPlanImplItem[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.complete = formBuilder.control<boolean>(false, { nonNullable: true });
    this.techniques = formBuilder.control<string[]>([], { nonNullable: true });
    this.features = formBuilder.control<string[]>([], { nonNullable: true });
    this.description = formBuilder.control<string | null>(null);
    this.items = formBuilder.control([], {
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      complete: this.complete,
      techniques: this.techniques,
      features: this.features,
      description: this.description,
      items: this.items,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'fig-plan-techniques';
    if (this.hasThesaurus(key)) {
      this.techniqueEntries.set(thesauri[key].entries);
    } else {
      this.techniqueEntries.set(undefined);
    }
    key = 'fig-plan-impl-features';
    if (this.hasThesaurus(key)) {
      this.featureEntries.set(thesauri[key].entries);
    } else {
      this.featureEntries.set(undefined);
    }

    key = 'fig-plan-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries.set(thesauri[key].entries);
    } else {
      this.typeEntries.set(undefined);
    }
    key = 'fig-plan-impl-positions';
    if (this.hasThesaurus(key)) {
      this.positionEntries.set(thesauri[key].entries);
    } else {
      this.positionEntries.set(undefined);
    }
    key = 'fig-plan-impl-change-types';
    if (this.hasThesaurus(key)) {
      this.changeTypeEntries.set(thesauri[key].entries);
    } else {
      this.changeTypeEntries.set(undefined);
    }
    key = 'fig-plan-impl-item-features';
    if (this.hasThesaurus(key)) {
      this.featureEntries.set(thesauri[key].entries);
    } else {
      this.featureEntries.set(undefined);
    }
    key = 'fig-plan-impl-matrix-types';
    if (this.hasThesaurus(key)) {
      this.matrixTypeEntries.set(thesauri[key].entries);
    } else {
      this.matrixTypeEntries.set(undefined);
    }
    key = 'fig-plan-impl-matrix-states';
    if (this.hasThesaurus(key)) {
      this.matrixStateEntries.set(thesauri[key].entries);
    } else {
      this.matrixStateEntries.set(undefined);
    }

    // asserted-id-scopes
    key = 'asserted-id-scopes';
    if (this.hasThesaurus(key)) {
      this.assIdScopeEntries.set(thesauri[key].entries);
    } else {
      this.assIdScopeEntries.set(undefined);
    }
    // asserted-id-tags
    key = 'asserted-id-tags';
    if (this.hasThesaurus(key)) {
      this.assIdTagEntries.set(thesauri[key].entries);
    } else {
      this.assIdTagEntries.set(undefined);
    }
    // assertion-tags
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    // doc-reference-types
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries.set(thesauri[key].entries);
    } else {
      this.refTypeEntries.set(undefined);
    }
    // doc-reference-tags
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries.set(thesauri[key].entries);
    } else {
      this.refTagEntries.set(undefined);
    }

    // physical-size-units
    key = 'physical-size-units';
    if (this.hasThesaurus(key)) {
      this.szUnitEntries.set(thesauri[key].entries);
    } else {
      this.szUnitEntries.set(undefined);
    }
    // physical-size-tags
    key = 'physical-size-tags';
    if (this.hasThesaurus(key)) {
      this.szTagEntries.set(thesauri[key].entries);
    } else {
      this.szTagEntries.set(undefined);
    }
    // physical-size-dim-tags
    key = 'physical-size-dim-tags';
    if (this.hasThesaurus(key)) {
      this.szDimTagEntries.set(thesauri[key].entries);
    } else {
      this.szDimTagEntries.set(undefined);
    }

    // fig-plan-item-label-types
    key = 'fig-plan-item-label-types';
    if (this.hasThesaurus(key)) {
      this.labelTypeEntries.set(thesauri[key].entries);
    } else {
      this.labelTypeEntries.set(undefined);
    }
    // fig-plan-item-label-languages
    key = 'fig-plan-item-label-languages';
    if (this.hasThesaurus(key)) {
      this.labelLangEntries.set(thesauri[key].entries);
    } else {
      this.labelLangEntries.set(undefined);
    }

    // print-font-families
    key = 'print-font-families';
    if (this.hasThesaurus(key)) {
      this.fontFamilyEntries.set(thesauri[key].entries);
    } else {
      this.fontFamilyEntries.set(undefined);
    }
    // print-layout-sections
    key = 'print-layout-sections';
    if (this.hasThesaurus(key)) {
      this.layoutSectionEntries.set(thesauri[key].entries);
    } else {
      this.layoutSectionEntries.set(undefined);
    }
    // print-font-features
    key = 'print-font-features';
    if (this.hasThesaurus(key)) {
      this.fontFeatureEntries.set(thesauri[key].entries);
    } else {
      this.fontFeatureEntries.set(undefined);
    }
  }

  private updateForm(part?: PrintFigPlanImplPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.complete.setValue(part.isComplete ? true : false);
    this.techniques.setValue(part.techniques || []);
    this.features.setValue(part.features || []);
    this.description.setValue(part.description || null);
    this.items.setValue(part.items || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(
    data?: EditedObject<PrintFigPlanImplPart>
  ): void {
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

  protected getValue(): PrintFigPlanImplPart {
    let part = this.getEditedPart(
      PRINT_FIG_PLAN_PART_TYPEID
    ) as PrintFigPlanImplPart;
    part.isComplete = this.complete.value;
    part.techniques = this.techniques.value || [];
    part.features = this.features.value || [];
    part.description = this.description.value?.trim() || undefined;
    part.items = this.items.value || [];
    return part;
  }

  //#region items
  public addItem(): void {
    const item: FigPlanImplItem = {
      eid: '',
      type: this.typeEntries()?.[0]?.id || '',
    };
    this.editItem(item, -1);
  }

  public editItem(item: FigPlanImplItem, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(item);
  }

  public closeItem(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveItem(item: FigPlanImplItem): void {
    const items = [...this.items.value];
    if (this.editedIndex() === -1) {
      items.push(item);
    } else {
      items.splice(this.editedIndex(), 1, item);
    }
    this.items.setValue(items);
    this.items.markAsDirty();
    this.items.updateValueAndValidity();
    this.closeItem();
  }

  public deleteItem(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Item?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeItem();
          }
          const items = [...this.items.value];
          items.splice(index, 1);
          this.items.setValue(items);
          this.items.markAsDirty();
          this.items.updateValueAndValidity();
        }
      });
  }

  public moveItemUp(index: number): void {
    if (index < 1) {
      return;
    }
    const item = this.items.value[index];
    const items = [...this.items.value];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.items.setValue(items);
    this.items.markAsDirty();
    this.items.updateValueAndValidity();
  }

  public moveItemDown(index: number): void {
    if (index + 1 >= this.items.value.length) {
      return;
    }
    const item = this.items.value[index];
    const items = [...this.items.value];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.items.setValue(items);
    this.items.markAsDirty();
    this.items.updateValueAndValidity();
  }
  //#endregion
}
