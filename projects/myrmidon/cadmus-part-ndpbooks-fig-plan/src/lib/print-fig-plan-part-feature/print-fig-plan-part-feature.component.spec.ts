import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { PrintFigPlanPartFeatureComponent } from './print-fig-plan-part-feature.component';
import { PrintFigPlanPartComponent } from '../print-fig-plan-part/print-fig-plan-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.print-fig-plan/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('PrintFigPlanPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new PrintFigPlanPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  it('should require all the print-fig-plan related thesauri', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual([
      'fig-plan-techniques',
      'fig-plan-types',
      'fig-plan-features',
      'asserted-id-scopes',
      'asserted-id-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
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
  selector: 'cadmus-print-fig-plan-part',
  template: '',
})
class MockPrintFigPlanPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('PrintFigPlanPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<PrintFigPlanPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PrintFigPlanPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(PrintFigPlanPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, PrintFigPlanPartComponent],
        },
        add: {
          imports: [MockCurrentItemBarComponent, MockPrintFigPlanPartComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PrintFigPlanPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
