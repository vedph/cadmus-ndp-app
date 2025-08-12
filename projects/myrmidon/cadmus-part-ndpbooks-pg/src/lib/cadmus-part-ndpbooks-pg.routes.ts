import { Routes } from '@angular/router';

// cadmus
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

import {
  PRINT_FONTS_PART_TYPEID,
  PrintFontsPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndpbooks-fonts';

export const CADMUS_PART_NDPBOOKS_PG_ROUTES: Routes = [
  {
    path: `${PRINT_FONTS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: PrintFontsPartFeatureComponent,
    canDeactivate: [PendingChangesGuard],
  },
];
