import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { CodFrQuireLabelsPartFeatureComponent } from './cod-fr-quire-labels-part-feature.component';
import { CodFrQuireLabelsPartComponent } from '../cod-fr-quire-labels-part/cod-fr-quire-labels-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.cod-fr-quire-labels/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('CodFrQuireLabelsPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new CodFrQuireLabelsPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  it('should require all the cod-fr-quire-labels related thesauri', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual([
      'doc-reference-types',
      'doc-reference-tags',
      'assertion-tags',
      'external-id-tags',
      'external-id-scopes',
      'cod-fr-quire-label-types',
      'cod-fr-quire-label-positions',
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
  selector: 'cadmus-cod-fr-quire-labels-part',
  template: '',
})
class MockCodFrQuireLabelsPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('CodFrQuireLabelsPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<CodFrQuireLabelsPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CodFrQuireLabelsPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(CodFrQuireLabelsPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, CodFrQuireLabelsPartComponent],
        },
        add: {
          imports: [
            MockCurrentItemBarComponent,
            MockCodFrQuireLabelsPartComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelsPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
