import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlatLookupPipe, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CloseSaveButtonsComponent,
  EditedObject,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  COD_FR_QUIRE_LABELS_PART_TYPEID,
  CodFrQuireLabel,
  CodFrQuireLabelsPart,
} from '../cod-fr-quire-labels-part';
import { CodFrQuireLabelEditorComponent } from '../cod-fr-quire-label-editor/cod-fr-quire-label-editor.component';

/**
 * CodFrQuireLabelsPart editor component.
 * Thesauri: ...TODO list of thesauri IDs...
 */
@Component({
  selector: 'cadmus-cod-fr-quire-labels',
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
    CodFrQuireLabelEditorComponent,
  ],
  templateUrl: './cod-fr-quire-labels.component.html',
  styleUrl: './cod-fr-quire-labels.component.css',
})
export class CodFrQuireLabelsComponent
  extends ModelEditorComponentBase<CodFrQuireLabelsPart>
  implements OnInit
{
  public editedIndex: number;
  public edited: CodFrQuireLabel | undefined;

  // doc-reference-types
  public refTypeEntries?: ThesaurusEntry[];
  // doc-reference-tags
  public refTagEntries?: ThesaurusEntry[];
  // assertion-tags
  public assTagEntries?: ThesaurusEntry[];
  // external-id-tags
  public idTagEntries?: ThesaurusEntry[];
  // external-id-scopes
  public idScopeEntries?: ThesaurusEntry[];

  // cod-fr-quire-label-types
  public typeEntries?: ThesaurusEntry[];
  // cod-fr-quire-label-positions
  public positionEntries?: ThesaurusEntry[];

  // TODO: add your thesauri entries here, e.g.:
  // cod-binding-tags
  // public tagEntries: ThesaurusEntry[] | undefined;

  public entries: FormControl<CodFrQuireLabel[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this.editedIndex = -1;
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
    // TODO setup your thesauri entries here, e.g.:
    // let key = 'cod-binding-tags';
    // if (this.hasThesaurus(key)) {
    //   this.tagEntries = thesauri[key].entries;
    // } else {
    //   this.tagEntries = undefined;
    // }
  }

  private updateForm(part?: CodFrQuireLabelsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.entries.setValue(part.labels || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(
    data?: EditedObject<CodFrQuireLabelsPart>
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodFrQuireLabelsPart {
    let part = this.getEditedPart(
      COD_FR_QUIRE_LABELS_PART_TYPEID
    ) as CodFrQuireLabelsPart;
    part.labels = this.entries.value || [];
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
    this.editedIndex = index;
    this.edited = entry;
  }

  public closeLabel(): void {
    this.editedIndex = -1;
    this.edited = undefined;
  }

  public saveLabel(entry: CodFrQuireLabel): void {
    const entries = [...this.entries.value];
    if (this.editedIndex === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex, 1, entry);
    }
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
    this.closeLabel();
  }

  public deleteLabel(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete label?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex === index) {
            this.closeLabel();
          }
          const entries = [...this.entries.value];
          entries.splice(index, 1);
          this.entries.setValue(entries);
          this.entries.markAsDirty();
          this.entries.updateValueAndValidity();
        }
      });
  }

  public moveLabelUp(index: number): void {
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

  public moveLabelDown(index: number): void {
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
