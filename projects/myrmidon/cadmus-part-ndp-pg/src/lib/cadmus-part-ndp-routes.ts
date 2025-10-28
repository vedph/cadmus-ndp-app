import { Routes } from '@angular/router';

import {
  NOTABLE_WORD_FORMS_PART_TYPEID,
  NotableWordFormsPartFeatureComponent,
} from '@myrmidon/cadmus-part-ndp-notable-word-forms';

// cadmus
import { pendingChangesGuard } from '@myrmidon/cadmus-core';

export const CADMUS_PART_NDP_PG_ROUTES: Routes = [
  {
    path: `${NOTABLE_WORD_FORMS_PART_TYPEID}/:pid`,
    pathMatch: 'full',
    component: NotableWordFormsPartFeatureComponent,
    canDeactivate: [pendingChangesGuard],
  },
];
