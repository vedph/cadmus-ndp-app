import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import {
  AssertedCompositeId,
  AssertedCompositeIdsComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { PrintFontEditorComponent } from './print-font-editor.component';
import { PrintFont } from '../print-fonts-part';

@Component({
  selector: 'cadmus-refs-asserted-composite-ids',
  template: '',
})
class MockAssertedCompositeIdsComponent {
  public readonly idScopeEntries = input<unknown>();
  public readonly idTagEntries = input<unknown>();
  public readonly assTagEntries = input<unknown>();
  public readonly refTypeEntries = input<unknown>();
  public readonly refTagEntries = input<unknown>();
  public readonly featureEntries = input<unknown>();
  public readonly lookupProviderOptions = input<unknown>();
  public readonly ids = input<AssertedCompositeId[]>();
  public readonly canSwitchMode = input<boolean>();
  public readonly canEditTarget = input<boolean>();
  public readonly idsChange = output<AssertedCompositeId[]>();
}

describe('PrintFontEditorComponent', () => {
  let component: PrintFontEditorComponent;
  let fixture: ComponentFixture<PrintFontEditorComponent>;

  const SECTION_ENTRIES: ThesaurusEntry[] = [
    { id: 'sec-a', value: 'Section A' },
    { id: 'sec-b', value: 'Section B' },
  ];
  const FEATURE_ENTRIES: ThesaurusEntry[] = [
    { id: 'feat-a', value: 'Feature A' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFontEditorComponent],
      providers: [provideNoopAnimations()],
    })
      .overrideComponent(PrintFontEditorComponent, {
        remove: { imports: [AssertedCompositeIdsComponent] },
        add: { imports: [MockAssertedCompositeIdsComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PrintFontEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('sectionFlags / featureFlags', () => {
    it('should map entries to flags', () => {
      fixture.componentRef.setInput('sectionEntries', SECTION_ENTRIES);
      fixture.componentRef.setInput('featureEntries', FEATURE_ENTRIES);
      fixture.detectChanges();

      expect(component.sectionFlags()).toEqual([
        { id: 'sec-a', label: 'Section A' },
        { id: 'sec-b', label: 'Section B' },
      ]);
      expect(component.featureFlags()).toEqual([
        { id: 'feat-a', label: 'Feature A' },
      ]);
    });

    it('should be empty arrays when no entries are provided', () => {
      fixture.detectChanges();

      expect(component.sectionFlags()).toEqual([]);
      expect(component.featureFlags()).toEqual([]);
    });
  });

  describe('binding the model (via font model effect)', () => {
    it('should reset the form when font is undefined', () => {
      fixture.componentRef.setInput('font', { family: 'Times' } as PrintFont);
      fixture.detectChanges();

      fixture.componentRef.setInput('font', undefined);
      fixture.detectChanges();

      expect(component.form.family().value()).toBe('');
    });

    it('should populate all controls from the data', () => {
      const ids: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      const font: PrintFont = {
        eid: 'font1',
        family: 'Times',
        sections: ['sec-a'],
        features: ['feat-a'],
        ids,
        note: 'a note',
      };

      fixture.componentRef.setInput('font', font);
      fixture.detectChanges();

      expect(component.form.eid().value()).toBe('font1');
      expect(component.form.family().value()).toBe('Times');
      expect(component.form.sections().value()).toEqual(['sec-a']);
      expect(component.form.features().value()).toEqual(['feat-a']);
      // the form tags array items with a Symbol: compare plain copies
      expect(JSON.parse(JSON.stringify(component.form.ids().value()))).toEqual(
        ids,
      );
      expect(component.form.note().value()).toBe('a note');
      expect(component.form().dirty()).toBe(false);
    });

    it('should default optional fields when absent', () => {
      fixture.componentRef.setInput('font', { family: 'Times' } as PrintFont);
      fixture.detectChanges();

      expect(component.form.eid().value()).toBe('');
      expect(component.form.sections().value()).toEqual([]);
      expect(component.form.features().value()).toEqual([]);
      expect(component.form.ids().value()).toEqual([]);
      expect(component.form.note().value()).toBe('');
    });
  });

  describe('onXxxChange handlers', () => {
    it('onSectionCheckedIdsChange should update sections and mark dirty', () => {
      fixture.detectChanges();
      component.onSectionCheckedIdsChange(['sec-a']);
      expect(component.form.sections().value()).toEqual(['sec-a']);
      expect(component.form.sections().dirty()).toBe(true);
    });

    it('onFeatureCheckedIdsChange should update features and mark dirty', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['feat-a']);
      expect(component.form.features().value()).toEqual(['feat-a']);
      expect(component.form.features().dirty()).toBe(true);
    });

    it('onIdsChange should update ids and mark dirty', () => {
      fixture.detectChanges();
      const ids: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onIdsChange(ids);
      expect(component.form.ids().value()).toEqual(ids);
      expect(component.form.ids().dirty()).toBe(true);
    });
  });

  describe('save', () => {
    it('should build and set minimal data by default', () => {
      fixture.detectChanges();
      component.form.family().value.set('Times');

      component.save();

      expect(component.font()).toEqual({
        eid: undefined,
        family: 'Times',
        sections: undefined,
        features: undefined,
        ids: undefined,
        note: undefined,
      });
    });

    it('should include eid, sections, features, ids and note when set', () => {
      fixture.detectChanges();
      component.form.eid().value.set('font1');
      component.form.family().value.set('Times');
      component.onSectionCheckedIdsChange(['sec-a']);
      component.onFeatureCheckedIdsChange(['feat-a']);
      const ids: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onIdsChange(ids);
      component.form.note().value.set('a note');

      component.save();

      expect(component.font()).toEqual({
        eid: 'font1',
        family: 'Times',
        sections: ['sec-a'],
        features: ['feat-a'],
        ids,
        note: 'a note',
      });
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.form.family().value.set('Times');
      component.form.family().markAsDirty();

      component.save();

      expect(component.form().dirty()).toBe(false);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.form.family().value.set('Times');
      component.form.family().markAsDirty();

      component.save(false);

      expect(component.form().dirty()).toBe(true);
      expect(component.font()).toBeTruthy();
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

  describe('child echoes', () => {
    it('should stay pristine when children echo their bound values', () => {
      fixture.componentRef.setInput('font', {
        family: 'Times',
        sections: ['sec-a'],
        ids: [{ target: { gid: 'g1', label: 'L1' } }],
      } as PrintFont);
      fixture.detectChanges();

      component.onSectionCheckedIdsChange(['sec-a']);
      component.onFeatureCheckedIdsChange([]);
      component.onIdsChange([{ target: { gid: 'g1', label: 'L1' } }]);

      expect(component.form().dirty()).toBe(false);
    });
  });

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });
  });
});
