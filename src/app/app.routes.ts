import { Routes } from '@angular/router';

// myrmidon
import { jwtAdminGuard, jwtGuard } from '@myrmidon/auth-jwt-login';

// libraries in this workspace
import { EditorGuardService } from '@myrmidon/cadmus-api';
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

// locals
import { HomeComponent } from './home/home.component';
import { ManageUsersPageComponent } from './manage-users-page/manage-users-page.component';
import { RegisterUserPageComponent } from './register-user-page/register-user-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { EditFrameStatsPageComponent } from './edit-frame-stats-page/edit-frame-stats-page.component';

export const routes: Routes = [
  // auth
  { path: 'login', component: LoginPageComponent },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [jwtGuard],
  },
  {
    path: 'register-user',
    component: RegisterUserPageComponent,
    canActivate: [jwtAdminGuard],
  },
  {
    path: 'manage-users',
    component: ManageUsersPageComponent,
    canActivate: [jwtAdminGuard],
  },
  {
    path: 'stats',
    component: EditFrameStatsPageComponent,
    canActivate: [jwtGuard],
  },
  // cadmus - items
  {
    path: 'items/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-editor').then(
        (module) => module.ItemEditorComponent
      ),
    canActivate: [jwtGuard],
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: 'items',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-list').then(
        (module) => module.ItemListComponent
      ),
    canActivate: [jwtGuard],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-search').then(
        (module) => module.ItemSearchComponent
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - thesauri
  {
    path: 'thesauri/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-editor').then(
        (module) => module.ThesaurusEditorFeatureComponent
      ),
    canActivate: [EditorGuardService],
  },
  {
    path: 'thesauri',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-list').then(
        (module) => module.ThesaurusListComponent
      ),
    canActivate: [EditorGuardService],
  },
  // cadmus - parts
  {
    path: 'items/:iid/general',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-general-pg').then(
        (module) => module.CadmusPartGeneralPgModule
      ),
    canActivate: [jwtGuard],
  },
  {
    path: 'items/:iid/philology',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-philology-pg').then(
        (module) => module.CadmusPartPhilologyPgModule
      ),
    canActivate: [jwtGuard],
  },
  {
    path: 'items/:iid/codicology',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-codicology-pg').then(
        (module) => module.CadmusPartCodicologyPgModule
      ),
    canActivate: [jwtGuard],
  },
  // geography
  {
    path: 'items/:iid/geography',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-geo-pg').then(
        (module) => module.CadmusPartGeoPgModule
      ),
    canActivate: [jwtGuard],
  },
  // epigraphy
  {
    path: 'items/:iid/epigraphy',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-epigraphy-pg').then(
        (module) => module.CadmusPartEpigraphyPgModule
      ),
    canActivate: [jwtGuard],
  },
  // ndp-frac parts
  {
    path: 'items/:iid/ndp-frac',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-ndpfrac-pg').then(
        (module) => module.CADMUS_PART_NDPFRAC_PG_ROUTES
      ),
    canActivate: [jwtGuard],
  },
  // ndp-books part
  {
    path: 'items/:iid/ndp-books',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-ndpbooks-pg').then(
        (module) => module.CADMUS_PART_NDPBOOKS_PG_ROUTES
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - graph
  {
    path: 'graph',
    loadComponent: () =>
      import('@myrmidon/cadmus-graph-pg-ex').then(
        (module) => module.GraphEditorExFeatureComponent
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - preview
  {
    path: 'preview',
    loadChildren: () =>
      import('@myrmidon/cadmus-preview-pg').then(
        (module) => module.CadmusPreviewPgModule
      ),
    canActivate: [jwtGuard],
  },
  // cadmus - flags
  {
    path: 'flags',
    loadComponent: () =>
      import('@myrmidon/cadmus-flags-pg').then(
        (module) => module.FlagsEditorFeatureComponent
      ),
    canActivate: [jwtGuard],
  },
  // home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  // fallback
  { path: '**', component: HomeComponent },
];
