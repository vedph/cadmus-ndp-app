import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlatLookupPipe, NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  ModelEditorComponentBase,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  COD_FR_QUIRE_LABELS_PART_TYPEID,
  CodFrQuireLabel,
  CodFrQuireLabelsPart,
} from '../cod-fr-quire-labels-part';
import { CodFrQuireLabelEditorComponent } from '../cod-fr-quire-label-editor/cod-fr-quire-label-editor.component';

interface CodFrQuireLabelsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

interface CodFrQuireLabelsPartControls {
  labels: CodFrQuireLabel[];
}

function toDraft(
  part?: CodFrQuireLabelsPart | null,
): CodFrQuireLabelsPartControls {
  // copy: the form tags the objects in its arrays
  return { labels: copyFormValue(part?.labels || []) };
}

/**
 * CodFrQuireLabelsPart editor component.
 * Thesauri: doc-reference-types, doc-reference-tags, assertion-tags,
 * external-id-tags, external-id-scopes,
 * cod-fr-quire-label-types, cod-fr-quire-label-positions,
 * asserted-id-features.
 */
@Component({
  selector: 'cadmus-cod-fr-quire-labels-part',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    // myrmidon
    FlatLookupPipe,
    // cadmus
    CloseSaveButtonsComponent,
    CodFrQuireLabelEditorComponent,
    HelpLinkComponent,
  ],
  templateUrl: './cod-fr-quire-labels-part.component.html',
  styleUrl: './cod-fr-quire-labels-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodFrQuireLabelsPartComponent extends ModelEditorComponentBase<CodFrQuireLabelsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<CodFrQuireLabel | undefined>(undefined);

  // doc-reference-types
  public readonly refTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly refTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // external-id-tags
  public readonly idTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-tags']?.entries,
  );
  // external-id-scopes
  public readonly idScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-scopes']?.entries,
  );
  // cod-fr-quire-label-types
  public readonly typeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-quire-label-types']?.entries,
  );
  // cod-fr-quire-label-positions
  public readonly positionEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-quire-label-positions']?.entries,
  );
  // asserted-id-features
  public readonly idFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-features']?.entries,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.labels, 1);
  });

  constructor() {
    super();
    this.initSettings<CodFrQuireLabelsPartSettings>(
      COD_FR_QUIRE_LABELS_PART_TYPEID,
      (settings) =>
        this.lookupProviderOptions.set(
          settings?.lookupProviderOptions || undefined,
        ),
    );
  }

  protected getValue(): CodFrQuireLabelsPart {
    const part = this.getEditedPart(
      COD_FR_QUIRE_LABELS_PART_TYPEID,
    ) as CodFrQuireLabelsPart;
    part.labels = copyFormValue(this._draft().labels);
    return part;
  }

  public addLabel(): void {
    const entry: CodFrQuireLabel = {
      types: [],
      positions: [],
    };
    this.editLabel(entry, -1);
  }

  public editLabel(entry: CodFrQuireLabel, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(structuredClone(entry));
  }

  public closeLabel(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveLabel(entry: CodFrQuireLabel): void {
    const entries = [...this.form.labels().value()];
    if (this.editedIndex() === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex(), 1, entry);
    }
    this.form.labels().value.set(entries);
    this.form.labels().markAsDirty();
    this.closeLabel();
  }

  public deleteLabel(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete label?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
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
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
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
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index + 1);
    } else if (this.editedIndex() === index + 1) {
      this.editedIndex.set(index);
    }
  }
}
