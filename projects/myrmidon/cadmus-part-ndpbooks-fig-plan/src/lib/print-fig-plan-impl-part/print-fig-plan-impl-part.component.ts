import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormField, maxLength } from '@angular/forms/signals';

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
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  CloseSaveButtonsComponent,
  copyFormValue,
  HelpLinkComponent,
  ModelEditorComponentBase,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  FigPlanImplItem,
  PrintFigPlanImplPart,
} from '../print-fig-plan-impl-part';
import { PRINT_FIG_PLAN_IMPL_PART_TYPEID } from '../print-fig-plan-impl-part';
import { FigPlanImplItemEditorComponent } from '../fig-plan-impl-item-editor/fig-plan-impl-item-editor.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface PrintFigPlanImplPartControls {
  complete: boolean;
  techniques: string[];
  features: string[];
  description: string;
  items: FigPlanImplItem[];
}

function toDraft(
  part?: PrintFigPlanImplPart | null,
): PrintFigPlanImplPartControls {
  return {
    complete: !!part?.isComplete,
    techniques: [...(part?.techniques || [])],
    features: [...(part?.features || [])],
    description: part?.description || '',
    items: copyFormValue(part?.items || []),
  };
}

/**
 * PrintFigPlanImplPart editor component.
 * Thesauri: fig-plan-types, fig-plan-impl-positions, fig-plan-impl-change-types,
 * fig-plan-impl-item-features, fig-plan-impl-matrix-types, fig-plan-impl-matrix-states,
 * asserted-id-scopes, asserted-id-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags, physical-size-units, physical-size-tags, physical-size-dim-tags,
 * fig-plan-item-label-types, fig-plan-item-label-languages, print-font-families,
 * print-layout-sections, print-font-features, asserted-id-features.
 */
@Component({
  selector: 'cadmus-print-fig-plan-impl-part',
  imports: [
    FormField,
    CommonModule,
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
    HelpLinkComponent,
    FigPlanImplItemEditorComponent,
  ],
  templateUrl: './print-fig-plan-impl-part.component.html',
  styleUrl: './print-fig-plan-impl-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintFigPlanImplPartComponent extends ModelEditorComponentBase<PrintFigPlanImplPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<FigPlanImplItem | undefined>(undefined);

  // fig-plan-techniques
  public readonly techniqueEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-techniques']?.entries,
  );
  // fig-plan-impl-features
  public readonly featureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-impl-features']?.entries,
  );

  // fig-plan-types
  public readonly typeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-types']?.entries,
  );
  // fig-plan-impl-positions
  public readonly positionEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-impl-positions']?.entries,
  );
  // fig-plan-impl-change-types
  public readonly changeTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-impl-change-types']?.entries,
  );
  // fig-plan-impl-item-features
  public readonly itemFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-impl-item-features']?.entries,
  );
  // fig-plan-impl-matrix-types
  public readonly matrixTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-impl-matrix-types']?.entries,
  );
  // fig-plan-impl-matrix-states
  public readonly matrixStateEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-impl-matrix-states']?.entries,
  );

  // asserted-id-scopes
  public readonly assIdScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-scopes']?.entries,
  );
  // asserted-id-tags
  public readonly assIdTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );

  // physical-size-units
  public readonly szUnitEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-units']?.entries,
  );
  // physical-size-tags
  public readonly szTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-tags']?.entries,
  );
  // physical-size-dim-tags
  public readonly szDimTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['physical-size-dim-tags']?.entries,
  );

  // fig-plan-item-label-types
  public readonly labelTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-item-label-types']?.entries,
  );
  // fig-plan-item-label-languages
  public readonly labelLangEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-item-label-languages']?.entries,
  );

  // print-font-families
  public readonly fontFamilyEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['print-font-families']?.entries,
  );
  // print-layout-sections
  public readonly layoutSectionEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['print-layout-sections']?.entries,
  );
  // print-font-features
  public readonly fontFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['print-font-features']?.entries,
  );
  // asserted-id-features
  public readonly idFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-features']?.entries,
  );

  // flags mapped from thesaurus entries
  public techniqueFlags = computed<Flag[]>(
    () => this.techniqueEntries()?.map((e) => entryToFlag(e)) || [],
  );
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || [],
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    maxLength(p.description, 5000);
  });

  public onTechniqueCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.techniques, [...(ids || [])]);
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  protected getValue(): PrintFigPlanImplPart {
    const part = this.getEditedPart(
      PRINT_FIG_PLAN_IMPL_PART_TYPEID,
    ) as PrintFigPlanImplPart;
    const draft = this._draft();
    part.isComplete = draft.complete;
    part.techniques = [...draft.techniques];
    part.features = [...draft.features];
    part.description = draft.description.trim() || undefined;
    part.items = copyFormValue(draft.items);
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
    // structuredClone also drops the form's Symbol tag
    this.edited.set(structuredClone(item));
  }

  public closeItem(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveItem(item: FigPlanImplItem): void {
    const items = [...this.form.items().value()];
    if (this.editedIndex() === -1) {
      items.push(item);
    } else {
      items.splice(this.editedIndex(), 1, item);
    }
    this.form.items().value.set(items);
    this.form.items().markAsDirty();
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
          const items = [...this.form.items().value()];
          items.splice(index, 1);
          this.form.items().value.set(items);
          this.form.items().markAsDirty();
        }
      });
  }

  public moveItemUp(index: number): void {
    if (index < 1) {
      return;
    }
    const items = [...this.form.items().value()];
    const item = items[index];
    items.splice(index, 1);
    items.splice(index - 1, 0, item);
    this.form.items().value.set(items);
    this.form.items().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
    }
  }

  public moveItemDown(index: number): void {
    if (index + 1 >= this.form.items().value().length) {
      return;
    }
    const items = [...this.form.items().value()];
    const item = items[index];
    items.splice(index, 1);
    items.splice(index + 1, 0, item);
    this.form.items().value.set(items);
    this.form.items().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index + 1);
    } else if (this.editedIndex() === index + 1) {
      this.editedIndex.set(index);
    }
  }
  //#endregion
}
