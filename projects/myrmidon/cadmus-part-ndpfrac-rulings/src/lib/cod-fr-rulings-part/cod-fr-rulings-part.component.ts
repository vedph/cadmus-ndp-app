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

import {
  COD_FR_RULINGS_PART_TYPEID,
  CodFrRuling,
  CodFrRulingsPart,
} from '../cod-fr-rulings-part';
import { CodFrRulingEditorComponent } from '../cod-fr-ruling-editor/cod-fr-ruling-editor.component';

interface CodFrRulingsPartControls {
  entries: CodFrRuling[];
}

function toDraft(part?: CodFrRulingsPart | null): CodFrRulingsPartControls {
  // copy: the form tags the objects in its arrays
  return { entries: copyFormValue(part?.rulings || []) };
}

/**
 * CodFrRulingsPart editor component.
 * Thesauri: cod-fr-ruling-systems, cod-fr-ruling-types, cod-fr-ruling-features.
 */
@Component({
  selector: 'cadmus-cod-fr-rulings-part',
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
    CodFrRulingEditorComponent,
    HelpLinkComponent,
  ],
  templateUrl: './cod-fr-rulings-part.component.html',
  styleUrls: ['./cod-fr-rulings-part.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodFrRulingsPartComponent extends ModelEditorComponentBase<CodFrRulingsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<CodFrRuling | undefined>(undefined);

  // cod-fr-ruling-systems
  public readonly systemEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-ruling-systems']?.entries,
  );
  // cod-fr-ruling-types
  public readonly typeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-ruling-types']?.entries,
  );
  // cod-fr-ruling-features
  public readonly featureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-ruling-features']?.entries,
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.entries, 1);
  });

  protected getValue(): CodFrRulingsPart {
    const part = this.getEditedPart(
      COD_FR_RULINGS_PART_TYPEID,
    ) as CodFrRulingsPart;
    part.rulings = copyFormValue(this._draft().entries);
    return part;
  }

  public addRuling(): void {
    const ruling: CodFrRuling = {
      features: [],
    };
    this.editRuling(ruling, -1);
  }

  public editRuling(ruling: CodFrRuling, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(structuredClone(ruling));
  }

  public closeRuling(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveRuling(entry: CodFrRuling): void {
    const entries = [...this.form.entries().value()];
    if (this.editedIndex() === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex(), 1, entry);
    }
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    this.closeRuling();
  }

  public deleteRuling(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete ruling?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeRuling();
          }
          const entries = [...this.form.entries().value()];
          entries.splice(index, 1);
          this.form.entries().value.set(entries);
          this.form.entries().markAsDirty();
        }
      });
  }

  public moveRulingUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entries = [...this.form.entries().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
    }
  }

  public moveRulingDown(index: number): void {
    if (index + 1 >= this.form.entries().value().length) {
      return;
    }
    const entries = [...this.form.entries().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index + 1);
    } else if (this.editedIndex() === index + 1) {
      this.editedIndex.set(index);
    }
  }
}
