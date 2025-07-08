import { Component, OnInit } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  PhysicalGridCoordsService,
  PhysicalGridLocation,
  PhysicalGridLocationComponent,
} from '@myrmidon/cadmus-mat-physical-grid';

import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  EditedObject,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';

import {
  CodFrSupportPart,
  COD_FR_SUPPORT_PART_TYPEID,
} from '../cod-fr-support-part';

// import the custom element
import '@myrmidon/cod-layout-view';

/**
 * CodFrSupport part editor component.
 * Thesauri: cod-fr-support-materials, cod-fr-support-reuse-types,
 * cod-fr-support-containers.
 */
@Component({
  selector: 'cadmus-cod-fr-support-part',
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
    MatTooltipModule,
    // myrmidon
    PhysicalGridLocationComponent,
    // cadmus
    CloseSaveButtonsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cod-fr-support-part.component.html',
  styleUrl: './cod-fr-support-part.component.css',
})
export class CodFrSupportPartComponent
  extends ModelEditorComponentBase<CodFrSupportPart>
  implements OnInit
{
  public material: FormControl<string>;
  public location: FormControl<PhysicalGridLocation | null>;
  public container: FormControl<string>;
  public reuse: FormControl<string | null>;
  public supposedReuse: FormControl<string | null>;

  // cod-fr-support-materials
  public materialEntries?: ThesaurusEntry[];
  // cod-fr-support-reuse-types
  public reuseEntries?: ThesaurusEntry[];
  // cod-fr-support-containers
  public containerEntries?: ThesaurusEntry[];

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _coordsService: PhysicalGridCoordsService
  ) {
    super(authService, formBuilder);
    // form
    this.material = formBuilder.control('', {
      validators: Validators.maxLength(100),
      nonNullable: true,
    });
    this.location = formBuilder.control(null, Validators.required);
    this.container = formBuilder.control('', {
      validators: Validators.maxLength(100),
      nonNullable: true,
    });
    this.reuse = formBuilder.control(null, Validators.maxLength(100));
    this.supposedReuse = formBuilder.control(null, Validators.maxLength(100));
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      material: this.material,
      location: this.location,
      container: this.container,
      reuse: this.reuse,
      supposedReuse: this.supposedReuse,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'cod-fr-support-materials';
    if (this.hasThesaurus(key)) {
      this.materialEntries = thesauri[key].entries;
    } else {
      this.materialEntries = undefined;
    }
    key = 'cod-fr-support-reuse-types';
    if (this.hasThesaurus(key)) {
      this.reuseEntries = thesauri[key].entries;
    } else {
      this.reuseEntries = undefined;
    }
    key = 'cod-fr-support-containers';
    if (this.hasThesaurus(key)) {
      this.containerEntries = thesauri[key].entries;
    } else {
      this.containerEntries = undefined;
    }
  }

  private updateForm(part?: CodFrSupportPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.material.setValue(
      part.material || this.materialEntries?.[0]?.id || ''
    );
    // if the location is not valid, it will be set to null
    this.location.setValue(
      (this._coordsService.parsePhysicalGridCoords(
        part.location,
        3,
        3,
        true
      ) as PhysicalGridLocation) || null
    );
    this.container.setValue(part.container || '');
    this.reuse.setValue(part.reuse || null);
    this.supposedReuse.setValue(part.supposedReuse || null);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<CodFrSupportPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  public onLocationChange(location: PhysicalGridLocation | null): void {
    this.location.setValue(location);
    this.location.markAsDirty();
  }

  protected getValue(): CodFrSupportPart {
    let part = this.getEditedPart(
      COD_FR_SUPPORT_PART_TYPEID
    ) as CodFrSupportPart;
    part.material = this.material.value || '';
    part.location = this.location.value
      ? this._coordsService.physicalGridCoordsToString(this.location.value)
      : '';
    part.container = this.container.value?.trim() || '';
    part.reuse = this.reuse.value?.trim() || undefined;
    part.supposedReuse = this.supposedReuse.value?.trim() || undefined;
    return part;
  }
}
