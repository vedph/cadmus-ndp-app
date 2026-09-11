import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { DrawingTechPartFeatureComponent } from './drawing-tech-part-feature.component';
import { DrawingTechPartComponent } from '../drawing-tech-part/drawing-tech-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.drawing-tech/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('DrawingTechPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new DrawingTechPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  it('should require all the drawing-tech related thesauri', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual([
      'drawing-tech-materials',
      'drawing-tech-features',
      'drawing-tech-techniques',
      'drawing-tech-colors',
      'drawing-tech-size-units',
      'drawing-tech-dim-tags',
      'drawing-tech-measure-names',
    ]);
  });

  it('should not enable role-suffixed thesauri lookup', () => {
    const { feature } = createFeature();

    expect((feature as any).roleIdInThesauri).toBeUndefined();
  });
});

@Component({
  selector: 'cadmus-current-item-bar',
  template: '',
})
class MockCurrentItemBarComponent {}

@Component({
  selector: 'cadmus-drawing-tech-part',
  template: '',
})
class MockDrawingTechPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('DrawingTechPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<DrawingTechPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DrawingTechPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(DrawingTechPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, DrawingTechPartComponent],
        },
        add: {
          imports: [MockCurrentItemBarComponent, MockDrawingTechPartComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DrawingTechPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
