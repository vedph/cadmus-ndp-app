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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  copyFormValue,
  ModelEditorComponentBase,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { FlatLookupPipe } from '@myrmidon/ngx-tools';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  FigPlanItem,
  PRINT_FIG_PLAN_PART_TYPEID,
  PrintFigPlanPart,
} from '../print-fig-plan-part';
import { FigPlanItemEditorComponent } from '../fig-plan-item-editor/fig-plan-item-editor.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

interface PrintFigPlanPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

interface PrintFigPlanPartControls {
  artistIds: AssertedCompositeId[];
  techniques: string[];
  features: string[];
  description: string;
  items: FigPlanItem[];
}

function toDraft(part?: PrintFigPlanPart | null): PrintFigPlanPartControls {
  return {
    artistIds: copyFormValue(part?.artistIds || []),
    techniques: [...(part?.techniques || [])],
    features: [...(part?.features || [])],
    description: part?.description || '',
    items: copyFormValue(part?.items || []),
  };
}

/**
 * Printed book figurative part editor component.
 * Thesauri: fig-plan-techniques, fig-plan-types, fig-plan-features,
 * asserted-id-scopes, asserted-id-tags, assertion-tags, doc-reference-types,
 * doc-reference-tags, asserted-id-features.
 */
@Component({
  selector: 'cadmus-print-fig-plan-part',
  imports: [
    CommonModule,
    FormField,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabGroup,
    MatTab,
    MatTooltipModule,
    // cadmus
    FlatLookupPipe,
    CloseSaveButtonsComponent,
    AssertedCompositeIdsComponent,
    FlagSetComponent,
    FigPlanItemEditorComponent,
  ],
  templateUrl: './print-fig-plan-part.component.html',
  styleUrl: './print-fig-plan-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintFigPlanPartComponent extends ModelEditorComponentBase<PrintFigPlanPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly edited = signal<FigPlanItem | undefined>(undefined);
  public readonly editedIndex = signal<number>(-1);

  // fig-plan-techniques
  public readonly planTechEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-techniques']?.entries,
  );
  // fig-plan-types
  public readonly planTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-types']?.entries,
  );
  // fig-plan-features
  public readonly planFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['fig-plan-features']?.entries,
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
  public readonly docRefTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly docRefTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // asserted-id-features
  public readonly idFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-features']?.entries,
  );

  // flags mapped from thesaurus entries
  public techFlags = computed<Flag[]>(
    () => this.planTechEntries()?.map((e) => entryToFlag(e)) || [],
  );
  public featureFlags = computed<Flag[]>(
    () => this.planFeatureEntries()?.map((e) => entryToFlag(e)) || [],
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    maxLength(p.description, 1000);
  });

  constructor() {
    super();
    this.initSettings<PrintFigPlanPartSettings>(
      PRINT_FIG_PLAN_PART_TYPEID,
      (settings) =>
        this.lookupProviderOptions.set(
          settings?.lookupProviderOptions || undefined,
        ),
    );
  }

  public onTechniqueCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.techniques, [...(ids || [])]);
  }

  public onFeatureCheckedIdsChange(ids: string[]): void {
    setFieldFromChild(this.form.features, [...(ids || [])]);
  }

  public onArtistIdsChange(ids: AssertedCompositeId[]): void {
    setFieldFromChild(this.form.artistIds, copyFormValue(ids || []));
  }

  public addItem(): void {
    const item: FigPlanItem = {
      eid: '',
      type: this.planTypeEntries()?.length ? this.planTypeEntries()![0].id : '',
    };
    this.editItem(item, -1);
  }

  public editItem(item: FigPlanItem, index: number): void {
    this.editedIndex.set(index);
    // structuredClone also drops the form's Symbol tag
    this.edited.set(structuredClone(item));
  }

  public closeItem(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveItem(entry: FigPlanItem): void {
    const items = [...this.form.items().value()];
    if (this.editedIndex() === -1) {
      items.push(entry);
    } else {
      items.splice(this.editedIndex(), 1, entry);
    }
    this.form.items().value.set(items);
    this.form.items().markAsDirty();
    this.closeItem();
  }

  public deleteItem(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete item?')
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

  protected getValue(): PrintFigPlanPart {
    const part = this.getEditedPart(
      PRINT_FIG_PLAN_PART_TYPEID,
    ) as PrintFigPlanPart;
    const draft = this._draft();
    part.artistIds = draft.artistIds.length
      ? copyFormValue(draft.artistIds)
      : undefined;
    part.techniques = [...draft.techniques];
    part.features = draft.features.length ? [...draft.features] : undefined;
    part.description = draft.description.trim() || undefined;
    part.items = draft.items.length ? copyFormValue(draft.items) : undefined;
    return part;
  }
}
