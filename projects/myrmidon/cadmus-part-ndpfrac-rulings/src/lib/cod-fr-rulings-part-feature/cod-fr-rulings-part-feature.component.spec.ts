import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { CodFrRulingsPartFeatureComponent } from './cod-fr-rulings-part-feature.component';
import { CodFrRulingsPartComponent } from '../cod-fr-rulings-part/cod-fr-rulings-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.cod-fr-rulings/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('CodFrRulingsPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new CodFrRulingsPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  it('should require all the cod-fr-rulings related thesauri', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual([
      'cod-fr-ruling-systems',
      'cod-fr-ruling-types',
      'cod-fr-ruling-features',
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
  selector: 'cadmus-cod-fr-rulings-part',
  template: '',
})
class MockCodFrRulingsPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('CodFrRulingsPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<CodFrRulingsPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CodFrRulingsPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(CodFrRulingsPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, CodFrRulingsPartComponent],
        },
        add: {
          imports: [MockCurrentItemBarComponent, MockCodFrRulingsPartComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrRulingsPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
