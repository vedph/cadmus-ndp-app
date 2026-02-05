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

import {
  deepCopy,
  FlatLookupPipe,
  NgxToolsValidators,
} from '@myrmidon/ngx-tools';
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
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<CodFrQuireLabel | undefined>(undefined);

  // doc-reference-types
  public readonly refTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-tags
  public readonly refTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // external-id-tags
  public readonly idTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // external-id-scopes
  public readonly idScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // cod-fr-quire-label-types
  public readonly typeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // cod-fr-quire-label-positions
  public readonly positionEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // asserted-id-features
  public readonly idFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public labels: FormControl<CodFrQuireLabel[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
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
      this.refTypeEntries.set(thesauri[key].entries);
    } else {
      this.refTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.refTagEntries.set(thesauri[key].entries);
    } else {
      this.refTagEntries.set(undefined);
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.idTagEntries.set(thesauri[key].entries);
    } else {
      this.idTagEntries.set(undefined);
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.idScopeEntries.set(thesauri[key].entries);
    } else {
      this.idScopeEntries.set(undefined);
    }
    key = 'cod-fr-quire-label-types';
    if (this.hasThesaurus(key)) {
      this.typeEntries.set(thesauri[key].entries);
    } else {
      this.typeEntries.set(undefined);
    }
    key = 'cod-fr-quire-label-positions';
    if (this.hasThesaurus(key)) {
      this.positionEntries.set(thesauri[key].entries);
    } else {
      this.positionEntries.set(undefined);
    }
    key = 'asserted-id-features';
    if (this.hasThesaurus(key)) {
      this.idFeatureEntries.set(thesauri[key].entries);
    } else {
      this.idFeatureEntries.set(undefined);
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
    data?: EditedObject<CodFrQuireLabelsPart>,
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }
    // settings
    this._appRepository
      ?.getSettingFor<CodFrQuireLabelsPartSettings>(
        COD_FR_QUIRE_LABELS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });
    // form
    this.updateForm(data?.value);
  }

  protected getValue(): CodFrQuireLabelsPart {
    let part = this.getEditedPart(
      COD_FR_QUIRE_LABELS_PART_TYPEID,
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
    this.editedIndex.set(index);
    this.edited.set(deepCopy(entry));
  }

  public closeLabel(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveLabel(entry: CodFrQuireLabel): void {
    const entries = [...this.labels.value];
    if (this.editedIndex() === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex(), 1, entry);
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
          if (this.editedIndex() === index) {
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
