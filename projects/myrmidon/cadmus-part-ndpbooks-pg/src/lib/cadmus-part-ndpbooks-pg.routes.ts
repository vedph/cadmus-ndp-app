import { Routes } from '@angular/router';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

import {
  PRINT_FONTS_PART_TYPEID,
  PrintFontsPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpbooks-fonts';

import {
  PRINT_FIG_PLAN_PART_TYPEID,
  PRINT_FIG_PLAN_IMPL_PART_TYPEID,
  PrintFigPlanImplPartFeatureComponent,
  PrintFigPlanPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpbooks-fig-plan';

export const CADMUS_PART_NDPBOOKS_PG_ROUTES: Routes = [
  {
    path: `${PRINT_FONTS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PrintFontsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${PRINT_FIG_PLAN_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PrintFigPlanPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: `${PRINT_FIG_PLAN_IMPL_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PrintFigPlanImplPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
];
