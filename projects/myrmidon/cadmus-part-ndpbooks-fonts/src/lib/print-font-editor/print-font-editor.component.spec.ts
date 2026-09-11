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

  describe('updateForm (via font model effect)', () => {
    it('should reset the form when font is undefined', () => {
      fixture.componentRef.setInput('font', { family: 'Times' } as PrintFont);
      fixture.detectChanges();

      fixture.componentRef.setInput('font', undefined);
      fixture.detectChanges();

      expect(component.family.value).toBe('');
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

      expect(component.eid.value).toBe('font1');
      expect(component.family.value).toBe('Times');
      expect(component.sections.value).toEqual(['sec-a']);
      expect(component.features.value).toEqual(['feat-a']);
      expect(component.ids.value).toEqual(ids);
      expect(component.note.value).toBe('a note');
      expect(component.form.pristine).toBe(true);
    });

    it('should default optional fields when absent', () => {
      fixture.componentRef.setInput('font', { family: 'Times' } as PrintFont);
      fixture.detectChanges();

      expect(component.eid.value).toBeNull();
      expect(component.sections.value).toEqual([]);
      expect(component.features.value).toEqual([]);
      expect(component.ids.value).toEqual([]);
      expect(component.note.value).toBeNull();
    });
  });

  describe('onXxxChange handlers', () => {
    it('onSectionCheckedIdsChange should update sections and mark dirty', () => {
      fixture.detectChanges();
      component.onSectionCheckedIdsChange(['sec-a']);
      expect(component.sections.value).toEqual(['sec-a']);
      expect(component.sections.dirty).toBe(true);
    });

    it('onFeatureCheckedIdsChange should update features and mark dirty', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['feat-a']);
      expect(component.features.value).toEqual(['feat-a']);
      expect(component.features.dirty).toBe(true);
    });

    it('onIdsChange should update ids and mark dirty', () => {
      fixture.detectChanges();
      const ids: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onIdsChange(ids);
      expect(component.ids.value).toEqual(ids);
      expect(component.ids.dirty).toBe(true);
    });
  });

  describe('save', () => {
    it('should build and set minimal data by default', () => {
      fixture.detectChanges();
      component.family.setValue('Times');

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
      component.eid.setValue('font1');
      component.family.setValue('Times');
      component.onSectionCheckedIdsChange(['sec-a']);
      component.onFeatureCheckedIdsChange(['feat-a']);
      const ids: AssertedCompositeId[] = [
        { target: { gid: 'g1', label: 'L1' } },
      ];
      component.onIdsChange(ids);
      component.note.setValue('a note');

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
      component.family.setValue('Times');
      component.family.markAsDirty();

      component.save();

      expect(component.form.pristine).toBe(true);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.family.setValue('Times');
      component.family.markAsDirty();

      component.save(false);

      expect(component.form.pristine).toBe(false);
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
});
