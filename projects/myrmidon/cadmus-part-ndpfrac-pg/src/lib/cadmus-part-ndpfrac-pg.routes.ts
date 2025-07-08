import { Routes } from '@angular/router';

import {
  COD_FR_LAYOUT_PART_TYPEID,
  CodFrLayoutPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-layout';

import {
  COD_FR_QUIRE_LABELS_PART_TYPEID,
  CodFrQuireLabelsPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-quire-labels';

import {
  COD_FR_RULINGS_PART_TYPEID,
  CodFrRulingsPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-rulings';

import {
  COD_FR_SUPPORT_PART_TYPEID,
  CodFrSupportPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpfrac-support';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

export const CADMUS_PART_NDPFRAC_PG_ROUTES: Routes = [
  {
    path: `${COD_FR_LAYOUT_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrLayoutPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_FR_QUIRE_LABELS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrQuireLabelsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_FR_RULINGS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrRulingsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${COD_FR_SUPPORT_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: CodFrSupportPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
];
