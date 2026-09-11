import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { CodFrLayoutPartFeatureComponent } from './cod-fr-layout-part-feature.component';
import { CodFrLayoutPartComponent } from '../cod-fr-layout-part/cod-fr-layout-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.cod-fr-layout/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('CodFrLayoutPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new CodFrLayoutPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  it('should require all the cod-fr-layout related thesauri', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual([
      'cod-fr-layout-features',
      'cod-fr-layout-prickings',
      'decorated-count-ids',
      'decorated-count-tags',
      'physical-size-units',
      'physical-size-dim-tags',
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
  selector: 'cadmus-cod-fr-layout-part',
  template: '',
})
class MockCodFrLayoutPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('CodFrLayoutPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<CodFrLayoutPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CodFrLayoutPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(CodFrLayoutPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, CodFrLayoutPartComponent],
        },
        add: {
          imports: [MockCurrentItemBarComponent, MockCodFrLayoutPartComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrLayoutPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
