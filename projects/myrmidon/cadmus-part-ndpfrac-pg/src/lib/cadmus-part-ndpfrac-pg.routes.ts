import { Routes } from '@angular/router';

import {
  COD_FR_QUIRE_LABELS_PART_TYPEID,
  CodFrQuireLabelsFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-quire-labels';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

export const CADMUS_PART_NDPFRAC_PG_ROUTES: Routes = [
  {
    path: `${COD_FR_QUIRE_LABELS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrQuireLabelsFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
];
