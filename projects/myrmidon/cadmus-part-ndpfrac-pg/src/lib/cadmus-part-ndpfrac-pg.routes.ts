import { Routes } from '@angular/router';

import {
  COD_FR_QUIRE_LABELS_PART_TYPEID,
  CodFrQuireLabelsFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-quire-labels';

import {
  COD_FR_RULINGS_PART_TYPEID,
  CodFrRulingsPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-rulings';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

export const CADMUS_PART_NDPFRAC_PG_ROUTES: Routes = [
  {
    path: `${COD_FR_QUIRE_LABELS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrQuireLabelsFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_FR_RULINGS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrRulingsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
];
