import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

// myrmidon
import { EnvService, RamStorageService } from '@myrmidon/ngx-tools';
import { AuthJwtService, GravatarPipe, User } from '@myrmidon/auth-jwt-login';

// bricks
import {
  CIT_SCHEME_SERVICE_SETTINGS_KEY,
  CitMappedValues,
  CitSchemeSettings,
  MapFormatter,
} from '@myrmidon/cadmus-refs-citation';
import {
  LOOKUP_CONFIGS_KEY,
  RefLookupConfig,
} from '@myrmidon/cadmus-refs-lookup';
import { ViafRefLookupService } from '@myrmidon/cadmus-refs-viaf-lookup';
import {
  ZOTERO_API_KEY_TOKEN,
  ZOTERO_USER_ID_TOKEN,
  ZOTERO_LIBRARY_ID_TOKEN,
  ZoteroRefLookupService,
} from '@myrmidon/cadmus-refs-zotero-lookup';

// cadmus
import { AppRepository } from '@myrmidon/cadmus-state';

import { DC_SCHEME } from './cit-schemes';

@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    GravatarPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly _subs: Subscription[] = [];

  public user?: User;
  public logged?: boolean;
  public itemBrowsers?: ThesaurusEntry[];
  public version: string;

  constructor(
    @Inject('itemBrowserKeys')
    private _itemBrowserKeys: { [key: string]: string },
    private _authService: AuthJwtService,
    private _appRepository: AppRepository,
    private _router: Router,
    env: EnvService,
    storage: RamStorageService,
    viaf: ViafRefLookupService,
    zotero: ZoteroRefLookupService
  ) {
    this.version = env.get('version') || '';

    // configure citation schemes
    this.configureCitationService(storage);

    // configure external lookup for asserted composite IDs
    storage.store(LOOKUP_CONFIGS_KEY, [
      // Zotero
      {
        name: 'Zotero',
        iconUrl: '/img/zotero128.png',
        description: 'Zotero bibliography',
        label: 'ID',
        service: zotero,
        itemIdGetter: (item: any) =>
          item ? `${item.library?.id}/${item.key}` : '',
        itemLabelGetter: (item: any) => {
          if (!item) {
            return '';
          }
          const sb: string[] = [];
          if (item.data?.creators && Array.isArray(item.data.creators)) {
            const creators = item.data.creators;
            for (let i = 0; i < creators.length; i++) {
              const c = creators[i];
              if (i > 0) {
                sb.push('; ');
              }
              if (c.lastName) {
                sb.push(c.lastName);
              }
              if (c.firstName) {
                sb.push(' ' + c.firstName.charAt(0) + '.');
              }
            }
          }
          sb.push(': ');
          if (item.title) {
            sb.push(item.title);
          } else if (item.data?.title) {
            sb.push(item.data?.title);
          }
          return sb.join('');
        },
      },
      // VIAF
      {
        name: 'VIAF',
        iconUrl: '/img/viaf128.png',
        description: 'Virtual International Authority File',
        label: 'ID',
        service: viaf,
        itemIdGetter: (item: any) => item?.viafid,
        itemLabelGetter: (item: any) => item?.term,
      },
    ] as RefLookupConfig[]);
  }

  private configureCitationService(storage: RamStorageService): void {
    // store settings via service
    storage.store(CIT_SCHEME_SERVICE_SETTINGS_KEY, {
      formats: {},
      schemes: {
        dc: DC_SCHEME,
      },
    } as CitSchemeSettings);
  }

  public ngOnInit(): void {
    this.user = this._authService.currentUserValue || undefined;
    this.logged = this.user !== null;

    // when the user logs in or out, reload the app data
    this._subs.push(
      this._authService.currentUser$.subscribe((user: User | null) => {
        this.logged = this._authService.isAuthenticated(true);
        this.user = user || undefined;
        if (user) {
          console.log('User logged in: ', user);
          this._appRepository.load();
        } else {
          console.log('User logged out');
        }
      })
    );

    // when the thesaurus is loaded, get the item browsers
    this._subs.push(
      this._appRepository.itemBrowserThesaurus$.subscribe(
        (thesaurus: Thesaurus | undefined) => {
          this.itemBrowsers = thesaurus ? thesaurus.entries : undefined;
        }
      )
    );
  }

  public ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
  }

  public logout(): void {
    if (!this.logged) {
      return;
    }
    this._authService
      .logout()
      .pipe(take(1))
      .subscribe((_) => {
        this._router.navigate(['/home']);
      });
  }
}
