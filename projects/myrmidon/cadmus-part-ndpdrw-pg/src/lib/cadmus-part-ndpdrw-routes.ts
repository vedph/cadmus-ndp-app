import { Routes } from '@angular/router';

// cadmus
import { pendingChangesGuard } from '@myrmidon/cadmus-core';

import {
  DRAWING_TECH_PART_TYPEID,
  DrawingTechPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpdrw-tech';

export const CADMUS_PART_NDPDRAWING_PG_ROUTES: Routes = [
  {
    path: `${DRAWING_TECH_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: DrawingTechPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
];
