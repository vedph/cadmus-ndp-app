import { Component, OnInit } from '@angular/core';
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
import { CodFrQuireLabelEditorComponent }
  from '../cod-fr-quire-label-editor/cod-fr-quire-label-editor.component';

/**
 * CodFrQuireLabelsPart editor component.
 * Thesauri: doc-reference-types, doc-reference-tags, assertion-tags,
 * external-id-tags, external-id-scopes,
 * cod-fr-quire-label-types, cod-fr-quire-label-positions.
 */
@Component({
  selector: 'cadmus-cod-fr-quire-labels-part',
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
  templateUrl: './cod-fr-quire-labels-part.component.html',
  styleUrl: './cod-fr-quire-labels-part.component.css',
})
export class CodFrQuireLabelsPartComponent
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

  public labels: FormControl<CodFrQuireLabel[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this.editedIndex = -1;
    // form
    this.labels = formBuilder.control([], {
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
      entries: this.labels,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.refTypeEntries = thesauri[key].entries;
    } else {
      this.refTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries = thesauri[key].entries;
    } else {
      this.refTagEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries = thesauri[key].entries;
    } else {
      this.idTagEntries = undefined;
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries = thesauri[key].entries;
    } else {
      this.idScopeEntries = undefined;
    }
    key = 'cod-fr-quire-label-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries = thesauri[key].entries;
    } else {
      this.typeEntries = undefined;
    }
    key = 'cod-fr-quire-label-positions';
    if (this.hasThesaurus(key)) {
      this.positionEntries = thesauri[key].entries;
    } else {
      this.positionEntries = undefined;
    }
  }

  private updateForm(part?: CodFrQuireLabelsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.labels.setValue(part.labels || []);
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
    part.labels = this.labels.value || [];
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
    const entries = [...this.labels.value];
    if (this.editedIndex === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex, 1, entry);
    }
    this.labels.setValue(entries);
    this.labels.markAsDirty();
    this.labels.updateValueAndValidity();
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
          const entries = [...this.labels.value];
          entries.splice(index, 1);
          this.labels.setValue(entries);
          this.labels.markAsDirty();
          this.labels.updateValueAndValidity();
        }
      });
  }

  public moveLabelUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.labels.value[index];
    const entries = [...this.labels.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.labels.setValue(entries);
    this.labels.markAsDirty();
    this.labels.updateValueAndValidity();
  }

  public moveLabelDown(index: number): void {
    if (index + 1 >= this.labels.value.length) {
      return;
    }
    const entry = this.labels.value[index];
    const entries = [...this.labels.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.labels.setValue(entries);
    this.labels.markAsDirty();
    this.labels.updateValueAndValidity();
  }
}
