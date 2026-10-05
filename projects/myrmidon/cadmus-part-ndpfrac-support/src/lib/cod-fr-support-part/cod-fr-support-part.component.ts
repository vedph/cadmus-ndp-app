import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import { FormField, maxLength, required } from '@angular/forms/signals';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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

import {
  PhysicalGridCoordsService,
  PhysicalGridLocation,
  PhysicalGridLocationComponent,
} from '@myrmidon/cadmus-mat-physical-grid';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  ModelEditorComponentBase,
  setFieldFromChild,
} from '@myrmidon/cadmus-ui';

import {
  CodFrSupportPart,
  COD_FR_SUPPORT_PART_TYPEID,
} from '../cod-fr-support-part';

// import the custom element
import '@myrmidon/cod-layout-view';

interface CodFrSupportPartControls {
  material: string;
  location: PhysicalGridLocation | null;
  container: string;
  reuse: string;
  supposedReuse: string;
}

/**
 * Part -> draft.
 * @param part The part.
 * @param materialEntries The materials thesaurus entries: when the part has
 * no material, the first one is used.
 * @param coords The service used to parse the location.
 */
function toDraft(
  part: CodFrSupportPart | null | undefined,
  materialEntries: ThesaurusEntry[] | undefined,
  coords: PhysicalGridCoordsService,
): CodFrSupportPartControls {
  if (!part) {
    return {
      material: '',
      location: null,
      container: '',
      reuse: '',
      supposedReuse: '',
    };
  }
  return {
    material: part.material || materialEntries?.[0]?.id || '',
    // if the location is not valid, it will be set to null
    location:
      (coords.parsePhysicalGridCoords(
        part.location,
        3,
        3,
        true,
      ) as PhysicalGridLocation) || null,
    container: part.container || '',
    reuse: part.reuse || '',
    supposedReuse: part.supposedReuse || '',
  };
}

/**
 * CodFrSupport part editor component.
 * Thesauri: cod-fr-support-materials, cod-fr-support-reuse-types,
 * cod-fr-support-containers.
 */
@Component({
  selector: 'cadmus-cod-fr-support-part',
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
    MatTooltipModule,
    // myrmidon
    PhysicalGridLocationComponent,
    // cadmus
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cod-fr-support-part.component.html',
  styleUrl: './cod-fr-support-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodFrSupportPartComponent extends ModelEditorComponentBase<CodFrSupportPart> {
  private readonly _coordsService = inject(PhysicalGridCoordsService);

  // cod-fr-support-materials
  public readonly materialEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-support-materials']?.entries,
  );
  // cod-fr-support-reuse-types
  public readonly reuseEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-support-reuse-types']?.entries,
  );
  // cod-fr-support-containers
  public readonly containerEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['cod-fr-support-containers']?.entries,
  );

  // the draft is rebuilt from each new data (including its thesauri)
  private readonly _draft = linkedSignal(() =>
    toDraft(this.data()?.value, this.materialEntries(), this._coordsService),
  );
  public readonly form = this.createForm(this._draft, (p) => {
    maxLength(p.material, 100);
    required(p.location);
    maxLength(p.container, 100);
    maxLength(p.reuse, 100);
    maxLength(p.supposedReuse, 100);
  });

  public onLocationChange(location: PhysicalGridLocation | null): void {
    setFieldFromChild(this.form.location, location || null);
  }

  protected getValue(): CodFrSupportPart {
    const part = this.getEditedPart(
      COD_FR_SUPPORT_PART_TYPEID,
    ) as CodFrSupportPart;
    const draft = this._draft();
    part.material = draft.material.trim();
    part.location = draft.location
      ? this._coordsService.physicalGridCoordsToString(draft.location)
      : '';
    part.container = draft.container.trim();
    part.reuse = draft.reuse.trim() || undefined;
    part.supposedReuse = draft.supposedReuse.trim() || undefined;
    return part;
  }
}
