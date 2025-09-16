import { Component, OnInit, signal } from '@angular/core';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { deepCopy, FlatLookupPipe, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
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

import {
  COD_FR_RULINGS_PART_TYPEID,
  CodFrRuling,
  CodFrRulingsPart,
} from '../cod-fr-rulings-part';
import { CodFrRulingEditorComponent } from '../cod-fr-ruling-editor/cod-fr-ruling-editor.component';

/**
 * CodFrRulingsPart editor component.
 * Thesauri: cod-fr-ruling-systems, cod-fr-ruling-types, cod-fr-ruling-features.
 */
@Component({
  selector: 'cadmus-cod-fr-rulings-part',
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
    // myrmidon
    FlatLookupPipe,
    // cadmus
    CloseSaveButtonsComponent,
    CodFrRulingEditorComponent,
  ],
  templateUrl: './cod-fr-rulings-part.component.html',
  styleUrls: ['./cod-fr-rulings-part.component.css'],
})
export class CodFrRulingsPartComponent
  extends ModelEditorComponentBase<CodFrRulingsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<CodFrRuling | undefined>(undefined);

  // cod-fr-ruling-systems
  public readonly systemEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-fr-ruling-types
  public readonly typeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-fr-ruling-features
  public readonly featureEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  public entries: FormControl<CodFrRuling[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.entries = formBuilder.control([], {
      // at least 1 entry
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.entries,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-fr-ruling-systems';
    if (this.hasThesaurus(key)) {
      this.systemEntries.set(thesauri[key].entries);
    } else {
      this.systemEntries.set(undefined);
    }
    key = 'cod-fr-ruling-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries.set(thesauri[key].entries);
    } else {
      this.typeEntries.set(undefined);
    }
    key = 'cod-fr-ruling-features';
    if (this.hasThesaurus(key)) {
      this.featureEntries.set(thesauri[key].entries);
    } else {
      this.featureEntries.set(undefined);
    }
  }

  private updateForm(part?: CodFrRulingsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.entries.setValue(part.rulings || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodFrRulingsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodFrRulingsPart {
    let part = this.getEditedPart(
      COD_FR_RULINGS_PART_TYPEID
    ) as CodFrRulingsPart;
    part.rulings = this.entries.value || [];
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
    this.edited.set(deepCopy(ruling));
  }

  public closeRuling(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveRuling(entry: CodFrRuling): void {
    const entries = [...this.entries.value];
    if (this.editedIndex() === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex(), 1, entry);
    }
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
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
          const entries = [...this.entries.value];
          entries.splice(index, 1);
          this.entries.setValue(entries);
          this.entries.markAsDirty();
          this.entries.updateValueAndValidity();
        }
      });
  }

  public moveRulingUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
  }

  public moveRulingDown(index: number): void {
    if (index + 1 >= this.entries.value.length) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
  }
}
