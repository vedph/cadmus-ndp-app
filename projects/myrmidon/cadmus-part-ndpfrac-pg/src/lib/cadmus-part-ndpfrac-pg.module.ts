import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  COD_FR_QUIRE_LABELS_PART_TYPEID,
  CodFrQuireLabelsFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-quire-labels';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

export const RouterModuleForChild = RouterModule.forChild([
  {
    path: `${COD_FR_QUIRE_LABELS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrQuireLabelsFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
]);

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Cadmus
    RouterModuleForChild,
  ],
  exports: [],
})
export class CadmusPartNdpFracPgModule {}
