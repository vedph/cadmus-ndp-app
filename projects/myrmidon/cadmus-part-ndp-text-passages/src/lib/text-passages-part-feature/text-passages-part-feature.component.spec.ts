import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-item-editor';

import { TextPassagesPartFeatureComponent } from './text-passages-part-feature.component';
import { TextPassagesPartComponent } from '../text-passages-part/text-passages-part.component';

function makeRoute(): ActivatedRoute {
  return {
    snapshot: {
      params: { iid: 'item1', pid: 'part1' },
      routeConfig: { path: 'it.vedph.ndp.text-passages/:pid' },
      queryParams: {},
    },
  } as unknown as ActivatedRoute;
}

describe('TextPassagesPartFeatureComponent (constructor/getReqThesauriIds)', () => {
  function createFeature() {
    const router = { navigate: vi.fn() };
    const snackbar = { open: vi.fn() };
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const feature = new TextPassagesPartFeatureComponent(
      router as unknown as Router,
      makeRoute(),
      snackbar as unknown as MatSnackBar,
      {} as unknown as ItemService,
      {} as unknown as ThesaurusService,
      editorService as unknown as PartEditorService,
    );
    return { feature, editorService };
  }

  it('should require the text-passage-tags and text-passage-features thesauri', () => {
    const { feature } = createFeature();

    const ids = (feature as any).getReqThesauriIds();

    expect(ids).toEqual(['text-passage-tags', 'text-passage-features']);
  });

  it('should enable role-suffixed thesauri lookup', () => {
    const { feature } = createFeature();

    (feature as any).getReqThesauriIds();

    expect((feature as any).roleIdInThesauri).toBe(true);
  });

  it('should load using the (unsuffixed, no role) identity from the route', async () => {
    const { feature, editorService } = createFeature();

    feature.ngOnInit();
    await Promise.resolve();
    await Promise.resolve();

    expect(editorService.load).toHaveBeenCalledWith(
      { itemId: 'item1', typeId: 'it.vedph.ndp.text-passages', partId: 'part1', roleId: undefined },
      ['text-passage-tags', 'text-passage-features'],
    );
  });
});

@Component({
  selector: 'cadmus-current-item-bar',
  template: '',
})
class MockCurrentItemBarComponent {}

@Component({
  selector: 'cadmus-text-passages-part',
  template: '',
})
class MockTextPassagesPartComponent {
  public readonly identity = input<unknown>();
  public readonly data = model<unknown>();
  public readonly editorClose = output();
  public readonly dirtyChange = output<boolean>();
}

describe('TextPassagesPartFeatureComponent (TestBed wiring)', () => {
  let fixture: ComponentFixture<TextPassagesPartFeatureComponent>;

  beforeEach(async () => {
    const editorService = {
      loading$: new Subject<boolean>(),
      saving$: new Subject<boolean>(),
      load: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TextPassagesPartFeatureComponent],
      providers: [
        { provide: ActivatedRoute, useValue: makeRoute() },
        { provide: ItemService, useValue: {} },
        { provide: ThesaurusService, useValue: {} },
        { provide: PartEditorService, useValue: editorService },
      ],
    })
      .overrideComponent(TextPassagesPartFeatureComponent, {
        remove: {
          imports: [CurrentItemBarComponent, TextPassagesPartComponent],
        },
        add: {
          imports: [MockCurrentItemBarComponent, MockTextPassagesPartComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TextPassagesPartFeatureComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
