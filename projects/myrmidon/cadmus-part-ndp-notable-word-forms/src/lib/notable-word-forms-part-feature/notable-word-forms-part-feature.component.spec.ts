import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { NotableWordFormsPartFeatureComponent } from './notable-word-forms-part-feature.component';
import { NotableWordFormsPartComponent } from '../notable-word-forms-part/notable-word-forms-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.notable-word-forms/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('NotableWordFormsPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new NotableWordFormsPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  it('should require all the notable-word-forms related thesauri', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual([
      'notable-word-forms-languages',
      'notable-word-forms-tags',
      'notable-word-forms-op-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'pin-link-scopes',
      'pin-link-tags',
      'pin-link-assertion-tags',
      'pin-link-docref-types',
      'pin-link-docref-tags',
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
  selector: 'cadmus-notable-word-forms-part',
  template: '',
})
class MockNotableWordFormsPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('NotableWordFormsPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<NotableWordFormsPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NotableWordFormsPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(NotableWordFormsPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, NotableWordFormsPartComponent],
        },
        add: {
          imports: [
            MockCurrentItemBarComponent,
            MockNotableWordFormsPartComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotableWordFormsPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
