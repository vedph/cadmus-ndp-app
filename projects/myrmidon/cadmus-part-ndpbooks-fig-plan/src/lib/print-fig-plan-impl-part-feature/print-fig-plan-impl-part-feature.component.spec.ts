import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { PrintFigPlanImplPartFeatureComponent } from './print-fig-plan-impl-part-feature.component';
import { PrintFigPlanImplPartComponent } from '../print-fig-plan-impl-part/print-fig-plan-impl-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.print-fig-plan-impl/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('PrintFigPlanImplPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new PrintFigPlanImplPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  // regression test: getReqThesauriIds() used to omit 'fig-plan-techniques'
  // and 'fig-plan-impl-features', even though the wrapped part component
  // reads exactly those two keys to populate its techniqueFlags()/
  // featureFlags() computed signals - so those sections could never show
  // any entries in production. Fixed to match the sibling
  // PrintFigPlanPartFeatureComponent, which does request its own
  // techniques/features thesauri.
  it('should require all the print-fig-plan-impl related thesauri, including techniques and features', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual([
      'fig-plan-techniques',
      'fig-plan-impl-features',
      'fig-plan-types',
      'fig-plan-impl-positions',
      'fig-plan-impl-change-types',
      'fig-plan-impl-item-features',
      'fig-plan-impl-matrix-types',
      'fig-plan-impl-matrix-states',
      'asserted-id-scopes',
      'asserted-id-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'physical-size-units',
      'physical-size-tags',
      'physical-size-dim-tags',
      'fig-plan-item-label-types',
      'fig-plan-item-label-languages',
      'print-font-families',
      'print-layout-sections',
      'print-font-features',
      'asserted-id-features',
    ]);
  });

  it('should enable role-suffixed thesauri lookup already from the constructor', () => {
    const { feature } = createFeature();

    expect((feature as any).roleIdInThesauri).toBe(true);
  });
});

@Component({
  selector: 'cadmus-current-item-bar',
  template: '',
})
class MockCurrentItemBarComponent {}

@Component({
  selector: 'cadmus-print-fig-plan-impl-part',
  template: '',
})
class MockPrintFigPlanImplPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('PrintFigPlanImplPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<PrintFigPlanImplPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PrintFigPlanImplPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(PrintFigPlanImplPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, PrintFigPlanImplPartComponent],
        },
        add: {
          imports: [
            MockCurrentItemBarComponent,
            MockPrintFigPlanImplPartComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PrintFigPlanImplPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
