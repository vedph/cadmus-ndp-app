import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import {
  Citation,
  CitationSpan,
  CitSchemeService,
  CompactCitationComponent,
} from '@myrmidon/cadmus-refs-citation';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CodLocationComponent,
  CodLocationParser,
  CodLocationRange,
} from '@myrmidon/cadmus-cod-location';
import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { FigPlanImplItemEditorComponent } from './fig-plan-impl-item-editor.component';
import { FigPlanItemLabelEditorComponent } from '../fig-plan-item-label-editor/fig-plan-item-label-editor.component';
import { FigPlanImplItem, FigPlanItemLabel } from '../print-fig-plan-impl-part';

// the form tags the objects in its arrays with a Symbol: compare plain copies
function json<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

@Component({
  selector: 'cadmus-refs-compact-citation',
  template: '',
})
class MockCompactCitationComponent {
  public readonly citation = input<Citation | CitationSpan | undefined>();
  public readonly citationChange = output<
    Citation | CitationSpan | undefined
  >();
}

@Component({
  selector: 'cadmus-cod-location',
  template: '',
})
class MockCodLocationComponent {
  public readonly single = input<boolean>();
  public readonly location = input<CodLocationRange[] | null>();
  public readonly locationChange = output<CodLocationRange[]>();
}

@Component({
  selector: 'cadmus-refs-asserted-composite-id',
  template: '',
})
class MockAssertedCompositeIdComponent {
  public readonly assTagEntries = input<unknown>();
  public readonly idScopeEntries = input<unknown>();
  public readonly idTagEntries = input<unknown>();
  public readonly refTagEntries = input<unknown>();
  public readonly refTypeEntries = input<unknown>();
  public readonly featureEntries = input<unknown>();
  public readonly canSwitchMode = input<boolean>();
  public readonly canEditTarget = input<boolean>();
  public readonly lookupProviderOptions = input<unknown>();
  public readonly id = input<AssertedCompositeId | undefined>();
  public readonly idChange = output<AssertedCompositeId | undefined>();
}

@Component({
  selector: 'cadmus-mat-physical-size',
  template: '',
})
class MockPhysicalSizeComponent {
  public readonly tagEntries = input<unknown>();
  public readonly unitEntries = input<unknown>();
  public readonly dimTagEntries = input<unknown>();
  public readonly size = input<PhysicalSize | undefined>();
  public readonly sizeChange = output<PhysicalSize>();
}

@Component({
  selector: 'cadmus-fig-plan-item-label-editor',
  template: '',
})
class MockFigPlanItemLabelEditorComponent {
  public readonly typeEntries = input<unknown>();
  public readonly label = input<FigPlanItemLabel | undefined>();
  public readonly labelChange = output<FigPlanItemLabel>();
  public readonly editorClose = output();
}

describe('FigPlanImplItemEditorComponent', () => {
  let component: FigPlanImplItemEditorComponent;
  let fixture: ComponentFixture<FigPlanImplItemEditorComponent>;
  let citService: CitSchemeService;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };

  const FEATURE_ENTRIES: ThesaurusEntry[] = [
    { id: 'feat-a', value: 'Feature A' },
  ];

  beforeEach(async () => {
    dialogService = { confirm: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FigPlanImplItemEditorComponent],
      providers: [
        provideNoopAnimations(),
        { provide: DialogService, useValue: dialogService },
      ],
    })
      .overrideComponent(FigPlanImplItemEditorComponent, {
        remove: {
          imports: [
            CompactCitationComponent,
            CodLocationComponent,
            AssertedCompositeIdComponent,
            PhysicalSizeComponent,
            FigPlanItemLabelEditorComponent,
          ],
        },
        add: {
          imports: [
            MockCompactCitationComponent,
            MockCodLocationComponent,
            MockAssertedCompositeIdComponent,
            MockPhysicalSizeComponent,
            MockFigPlanItemLabelEditorComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(FigPlanImplItemEditorComponent);
    component = fixture.componentInstance;
    citService = TestBed.inject(CitSchemeService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('featureFlags', () => {
    it('should map entries to flags', () => {
      fixture.componentRef.setInput('featureEntries', FEATURE_ENTRIES);
      fixture.detectChanges();
      expect(component.featureFlags()).toEqual([
        { id: 'feat-a', label: 'Feature A' },
      ]);
    });

    it('should be an empty array when no entries are provided', () => {
      fixture.detectChanges();
      expect(component.featureFlags()).toEqual([]);
    });
  });

  describe('buildForm / validity', () => {
    it('should be invalid without eid and type', () => {
      fixture.detectChanges();
      expect(component.form().invalid()).toBe(true);
    });

    it('should be valid with eid and type set', () => {
      fixture.detectChanges();
      component.form.eid().value.set('e1');
      component.form.type().value.set('type-a');
      expect(component.form().valid()).toBe(true);
    });
  });

  describe('binding the model (via item model effect)', () => {
    it('should reset the form and clear editedCit when item is undefined', () => {
      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
      } as FigPlanImplItem);
      fixture.detectChanges();

      fixture.componentRef.setInput('item', undefined);
      fixture.detectChanges();

      expect(component.form.eid().value()).toBe('');
      expect(component.editedCit()).toBeUndefined();
    });

    it('should parse a single citation when it has no " - "', () => {
      const parsed: Citation = { schemeId: 'dc', steps: [] };
      const parseSpy = vi.spyOn(citService, 'parse').mockReturnValue(parsed);

      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
        citation: 'If. I 1',
      } as FigPlanImplItem);
      fixture.detectChanges();

      expect(parseSpy).toHaveBeenCalledWith('If. I 1', 'dc');
      expect(component.editedCit()).toEqual(parsed);
    });

    it('should parse a citation span when it contains " - "', () => {
      const span: CitationSpan = { a: { schemeId: 'dc', steps: [] } };
      const parseSpanSpy = vi
        .spyOn(citService, 'parseSpan')
        .mockReturnValue(span);

      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
        citation: 'If. I 1 - If. I 10',
      } as FigPlanImplItem);
      fixture.detectChanges();

      expect(parseSpanSpy).toHaveBeenCalledWith('If. I 1 - If. I 10', 'dc');
      expect(component.editedCit()).toEqual(span);
    });

    it('should parse a location string into a single-range location value', () => {
      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
        location: '1r',
      } as FigPlanImplItem);
      fixture.detectChanges();

      const parsed = CodLocationParser.parseLocation('1r');
      expect(json(component.form.location().value())).toEqual([
        { start: parsed, end: parsed },
      ]);
    });

    it('should populate position, changeType, iconographyId, size, matrix fields and labels', () => {
      const iconographyId: AssertedCompositeId = {
        target: { gid: 'g1', label: 'L1' },
      };
      const size: PhysicalSize = {
        w: { value: 1, unit: 'cm' },
        h: { value: 2, unit: 'cm' },
      };
      const labels: FigPlanItemLabel[] = [{ type: 'legend' }];

      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
        position: 'in-text',
        changeType: 'added',
        iconographyId,
        features: ['feat-a'],
        size,
        matrixType: 'wood',
        matrixState: 'good',
        matrixStateDsc: 'a description',
        labels,
      } as FigPlanImplItem);
      fixture.detectChanges();

      expect(component.form.position().value()).toBe('in-text');
      expect(component.form.changeType().value()).toBe('added');
      expect(json(component.form.iconographyId().value())).toEqual(
        iconographyId,
      );
      expect(json(component.form.features().value())).toEqual(['feat-a']);
      expect(json(component.form.size().value())).toEqual(size);
      expect(component.form.matrixType().value()).toBe('wood');
      expect(component.form.matrixState().value()).toBe('good');
      expect(component.form.matrixStateDsc().value()).toBe('a description');
      expect(json(component.form.labels().value())).toEqual(labels);
      expect(component.form().dirty()).toBe(false);
    });
  });

  describe('onCitationChange', () => {
    it('should clear the citation control when passed undefined', () => {
      fixture.detectChanges();
      component.form.citation().value.set('If. I 1');

      component.onCitationChange(undefined);

      expect(component.form.citation().value()).toBe('');
    });

    it('should render a single citation via toString', () => {
      fixture.detectChanges();
      vi.spyOn(citService, 'toString').mockReturnValue('If. I 1');

      component.onCitationChange({ schemeId: 'dc', steps: [] });

      expect(component.form.citation().value()).toBe('If. I 1');
      expect(component.form.citation().dirty()).toBe(true);
    });

    it('should render a citation span as "a - b"', () => {
      fixture.detectChanges();
      vi.spyOn(citService, 'toString').mockImplementation((c: any) =>
        c.schemeId === 'dc' ? 'A' : 'B',
      );

      component.onCitationChange({
        a: { schemeId: 'dc', steps: [] },
        b: { schemeId: 'dc2', steps: [] },
      });

      expect(component.form.citation().value()).toBe('A - B');
    });
  });

  describe('onLocationChange / onIdChange / onFeatureCheckedIdsChange / onSizeChange', () => {
    it('onLocationChange should update location and mark dirty', () => {
      fixture.detectChanges();
      const parsed = CodLocationParser.parseLocation('1r')!;
      const range = [{ start: parsed, end: parsed }];

      component.onLocationChange(range);

      expect(json(component.form.location().value())).toEqual(range);
      expect(component.form.location().dirty()).toBe(true);
    });

    it('onIdChange should update iconographyId and mark dirty', () => {
      fixture.detectChanges();
      const id: AssertedCompositeId = { target: { gid: 'g1', label: 'L1' } };

      component.onIdChange(id);

      expect(json(component.form.iconographyId().value())).toEqual(id);
      expect(component.form.iconographyId().dirty()).toBe(true);
    });

    it('onFeatureCheckedIdsChange should update features and mark dirty', () => {
      fixture.detectChanges();

      component.onFeatureCheckedIdsChange(['feat-a']);

      expect(json(component.form.features().value())).toEqual(['feat-a']);
      expect(component.form.features().dirty()).toBe(true);
    });

    it('onSizeChange should update size and mark dirty', () => {
      fixture.detectChanges();
      const size: PhysicalSize = {
        w: { value: 1, unit: 'cm' },
        h: { value: 2, unit: 'cm' },
      };

      component.onSizeChange(size);

      expect(json(component.form.size().value())).toEqual(size);
      expect(component.form.size().dirty()).toBe(true);
    });
  });

  describe('label CRUD', () => {
    function makeLabel(type: string): FigPlanItemLabel {
      return { type };
    }

    it('addLabel should default the type to the first labelTypeEntries id', () => {
      fixture.componentRef.setInput('labelTypeEntries', [
        { id: 'legend', value: 'Legend' },
      ]);
      fixture.detectChanges();

      component.addLabel();

      expect(component.editedLabelIndex()).toBe(-1);
      expect(component.editedLabel()).toEqual({ type: 'legend' });
    });

    it('addLabel should default the type to an empty string with no labelTypeEntries', () => {
      fixture.detectChanges();

      component.addLabel();

      expect(component.editedLabel()).toEqual({ type: '' });
    });

    it('editLabel should open the editor with a deep clone', () => {
      fixture.detectChanges();
      const label = makeLabel('legend');

      component.editLabel(label, 1);

      expect(component.editedLabelIndex()).toBe(1);
      expect(component.editedLabel()).toEqual(label);
      expect(component.editedLabel()).not.toBe(label);
    });

    it('closeLabel should reset editedLabel/editedLabelIndex', () => {
      fixture.detectChanges();
      component.editLabel(makeLabel('legend'), 0);

      component.closeLabel();

      expect(component.editedLabelIndex()).toBe(-1);
      expect(component.editedLabel()).toBeUndefined();
    });

    it('saveLabel should append a new label when editedLabelIndex is -1', () => {
      fixture.detectChanges();
      component.form.labels().value.set([makeLabel('legend')]);
      component.addLabel();

      component.saveLabel(makeLabel('caption'));

      expect(json(component.form.labels().value())).toEqual([
        makeLabel('legend'),
        makeLabel('caption'),
      ]);
      expect(component.form.labels().dirty()).toBe(true);
      expect(component.editedLabelIndex()).toBe(-1);
    });

    it('saveLabel should replace the label at editedLabelIndex when editing', () => {
      fixture.detectChanges();
      component.form
        .labels()
        .value.set([makeLabel('legend'), makeLabel('caption')]);
      component.editLabel(makeLabel('caption'), 1);

      component.saveLabel(makeLabel('caption2'));

      expect(json(component.form.labels().value())).toEqual([
        makeLabel('legend'),
        makeLabel('caption2'),
      ]);
    });

    it('deleteLabel should remove the label when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.form
        .labels()
        .value.set([makeLabel('legend'), makeLabel('caption')]);

      component.deleteLabel(0);

      expect(json(component.form.labels().value())).toEqual([
        makeLabel('caption'),
      ]);
    });

    it('deleteLabel should not remove the label when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      component.form.labels().value.set([makeLabel('legend')]);

      component.deleteLabel(0);

      expect(json(component.form.labels().value())).toEqual([
        makeLabel('legend'),
      ]);
    });

    it('deleteLabel should close the editor when deleting the edited label', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.form.labels().value.set([makeLabel('legend')]);
      component.editLabel(makeLabel('legend'), 0);

      component.deleteLabel(0);

      expect(component.editedLabelIndex()).toBe(-1);
      expect(component.editedLabel()).toBeUndefined();
    });

    // regression tests for the editedLabelIndex desync bug found and
    // fixed in this and sibling libraries.
    describe('moveLabelUp / moveLabelDown', () => {
      it('moveLabelUp should keep editedLabelIndex tracking the moved-up label', () => {
        fixture.detectChanges();
        component.form
          .labels()
          .value.set([makeLabel('legend'), makeLabel('caption')]);
        component.editLabel(makeLabel('caption'), 1);

        component.moveLabelUp(1);

        expect(json(component.form.labels().value())).toEqual([
          makeLabel('caption'),
          makeLabel('legend'),
        ]);
        expect(component.editedLabelIndex()).toBe(0);
      });

      it('moveLabelUp should keep editedLabelIndex tracking the displaced label', () => {
        fixture.detectChanges();
        component.form
          .labels()
          .value.set([makeLabel('legend'), makeLabel('caption')]);
        component.editLabel(makeLabel('legend'), 0);

        component.moveLabelUp(1);

        expect(component.editedLabelIndex()).toBe(1);
      });

      it('moveLabelDown should keep editedLabelIndex tracking the moved-down label', () => {
        fixture.detectChanges();
        component.form
          .labels()
          .value.set([makeLabel('legend'), makeLabel('caption')]);
        component.editLabel(makeLabel('legend'), 0);

        component.moveLabelDown(0);

        expect(json(component.form.labels().value())).toEqual([
          makeLabel('caption'),
          makeLabel('legend'),
        ]);
        expect(component.editedLabelIndex()).toBe(1);
      });

      it('moveLabelDown should keep editedLabelIndex tracking the displaced label', () => {
        fixture.detectChanges();
        component.form
          .labels()
          .value.set([makeLabel('legend'), makeLabel('caption')]);
        component.editLabel(makeLabel('caption'), 1);

        component.moveLabelDown(0);

        expect(component.editedLabelIndex()).toBe(0);
      });

      it('should do nothing at the boundaries', () => {
        fixture.detectChanges();
        const labels = [makeLabel('legend'), makeLabel('caption')];
        component.form.labels().value.set(labels);

        component.moveLabelUp(0);
        component.moveLabelDown(1);

        expect(json(component.form.labels().value())).toEqual(labels);
        expect(component.form.labels().dirty()).toBe(false);
      });
    });
  });

  describe('save / getItem', () => {
    it('should touch all controls and not update the model when invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.item()).toBeUndefined();
      expect(component.form.eid().touched()).toBe(true);
    });

    it('should build minimal data when only eid/type are set', () => {
      fixture.detectChanges();
      component.form.eid().value.set('e1');
      component.form.type().value.set('type-a');

      component.save();

      expect(component.item()).toEqual({
        eid: 'e1',
        type: 'type-a',
        citation: undefined,
        location: undefined,
        position: undefined,
        changeType: undefined,
        iconographyId: undefined,
        features: undefined,
        size: undefined,
        matrixType: undefined,
        matrixState: undefined,
        matrixStateDsc: undefined,
        labels: undefined,
      });
    });

    it('should round-trip location through CodLocationParser', () => {
      fixture.detectChanges();
      component.form.eid().value.set('e1');
      component.form.type().value.set('type-a');
      const parsed = CodLocationParser.parseLocation('1r')!;
      component.onLocationChange([{ start: parsed, end: parsed }]);

      component.save();

      expect(component.item()?.location).toBe(
        CodLocationParser.locationToString(parsed),
      );
    });

    it('should trim matrixStateDsc and include set fields', () => {
      fixture.detectChanges();
      component.form.eid().value.set('e1');
      component.form.type().value.set('type-a');
      component.form.matrixStateDsc().value.set('  a description  ');
      component.onFeatureCheckedIdsChange(['feat-a']);
      const labels: FigPlanItemLabel[] = [{ type: 'legend' }];
      component.form.labels().value.set(labels);

      component.save();

      expect(component.item()?.matrixStateDsc).toBe('a description');
      expect(component.item()?.features).toEqual(['feat-a']);
      expect(json(component.item()?.labels)).toEqual(json(labels));
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.form.eid().value.set('e1');
      component.form.type().value.set('type-a');

      component.save();

      expect(component.form().dirty()).toBe(false);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.form.eid().value.set('e1');
      component.form.type().value.set('type-a');
      component.form.eid().markAsDirty();

      component.save(false);

      expect(component.form().dirty()).toBe(true);
      expect(component.item()).toBeTruthy();
    });
  });

  describe('cancel', () => {
    it('should emit cancelEdit', () => {
      fixture.detectChanges();
      const spy = vi.fn();
      component.cancelEdit.subscribe(spy);

      component.cancel();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });
  });
});

// the Discard button of a nested editor, not of editors nested inside it
function discardButtonOf(host: HTMLElement): HTMLButtonElement {
  const owner = (e: Element): Element | null => {
    let p = e.parentElement;
    while (p && !p.tagName.startsWith('CADMUS-')) {
      p = p.parentElement;
    }
    return p;
  };
  const button = Array.from(
    host.querySelectorAll<HTMLButtonElement>(
      'button[mattooltip="Discard changes"]',
    ),
  ).find((b) => owner(b) === host);
  expect(button).toBeTruthy();
  return button!;
}

// with the real label editor nested inside the item editor
describe('FigPlanImplItemEditorComponent (nested label editor)', () => {
  let component: FigPlanImplItemEditorComponent;
  let fixture: ComponentFixture<FigPlanImplItemEditorComponent>;

  const ITEM: FigPlanImplItem = {
    eid: 'e1',
    type: 'type-a',
    location: '1r',
    labels: [{ type: 'legend', value: 'v', fonts: [{ family: 'Times' }] }],
  };

  function pressEnter(input: HTMLInputElement): void {
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  // open the labels tab, where the label editor lives
  async function openLabelsTab(): Promise<void> {
    const tab = [...fixture.nativeElement.querySelectorAll('[role=tab]')].find(
      (t: HTMLElement) => /labels/i.test(t.textContent || ''),
    );
    (tab as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigPlanImplItemEditorComponent],
      providers: [
        provideNoopAnimations(),
        { provide: DialogService, useValue: { confirm: vi.fn() } },
      ],
    })
      .overrideComponent(FigPlanImplItemEditorComponent, {
        remove: {
          imports: [
            CompactCitationComponent,
            CodLocationComponent,
            AssertedCompositeIdComponent,
            PhysicalSizeComponent,
          ],
        },
        add: {
          imports: [
            MockCompactCitationComponent,
            MockCodLocationComponent,
            MockAssertedCompositeIdComponent,
            MockPhysicalSizeComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(FigPlanImplItemEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', structuredClone(ITEM));
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should close the label editor on its Discard button', async () => {
    component.editLabel(component.form.labels().value()[0], 0);
    await openLabelsTab();
    const host: HTMLElement = fixture.nativeElement.querySelector(
      'cadmus-fig-plan-item-label-editor',
    );
    expect(host).toBeTruthy();

    discardButtonOf(host).click();
    fixture.detectChanges();

    expect(component.editedLabel()).toBeUndefined();
    expect(component.editedLabelIndex()).toBe(-1);
  });

  it('should not save the item on Enter in a pristine nested label editor', async () => {
    // the item has unsaved, valid edits
    component.form.eid().value.set('e2');
    component.form.eid().markAsDirty();
    component.editLabel(component.form.labels().value()[0], 0);
    await openLabelsTab();

    const labelEditor: HTMLElement = fixture.nativeElement.querySelector(
      'cadmus-fig-plan-item-label-editor',
    );
    expect(labelEditor).toBeTruthy();
    pressEnter(labelEditor.querySelector('input')!);
    fixture.detectChanges();

    // neither the item nor the label was saved
    expect(component.item()?.eid).toBe('e1');
    expect(component.editedLabel()).toBeTruthy();
  });

  it('should save only the label on Enter in a dirty nested label editor', async () => {
    component.form.eid().value.set('e2');
    component.form.eid().markAsDirty();
    component.editLabel(component.form.labels().value()[0], 0);
    await openLabelsTab();

    const labelEditor: HTMLElement = fixture.nativeElement.querySelector(
      'cadmus-fig-plan-item-label-editor',
    );
    const input = labelEditor.querySelector('input')!;
    input.value = 'legend 2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    pressEnter(input);
    fixture.detectChanges();

    // the label was saved into the item's draft, and closed...
    expect(component.editedLabel()).toBeUndefined();
    expect(component.form.labels().value()[0].type).toBe('legend 2');
    // ...but the item itself was not saved
    expect(component.item()?.eid).toBe('e1');
  });

  it('should save the item on Enter in its own input', () => {
    component.form.eid().value.set('e2');
    component.form.eid().markAsDirty();
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[matInput]');
    pressEnter(input);

    expect(component.item()?.eid).toBe('e2');
  });

  it('should stay pristine when children echo their bound values', () => {
    component.onLocationChange(component.form.location().value());
    component.onFeatureCheckedIdsChange([]);
    component.onIdChange(null);
    component.onCitationChange(undefined);

    expect(component.form().dirty()).toBe(false);
  });

  it('should not carry the location over to an item without one', async () => {
    expect(component.form.location().value().length).toBe(1);

    fixture.componentRef.setInput('item', { eid: 'e2', type: 'type-a' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form.location().value()).toEqual([]);
  });
});
