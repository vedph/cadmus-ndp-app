import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodFrRulingEditorComponent } from './cod-fr-ruling-editor.component';
import { CodFrRuling } from '../cod-fr-rulings-part';

describe('CodFrRulingEditorComponent', () => {
  let component: CodFrRulingEditorComponent;
  let fixture: ComponentFixture<CodFrRulingEditorComponent>;

  const FEATURE_ENTRIES: ThesaurusEntry[] = [
    { id: 'feat-a', value: 'Feature A' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrRulingEditorComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(CodFrRulingEditorComponent);
    component = fixture.componentInstance;
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

  // regression test: a misplaced closing brace in the template used to
  // nest the "note" field (and the discard/accept buttons markup that
  // followed it, before this was noticed and fixed) inside the
  // `@if (featureFlags().length)` block, so the note field disappeared
  // entirely whenever there were no configured feature entries.
  describe('note field visibility', () => {
    it('should render the note field even when there are no feature entries', () => {
      fixture.detectChanges();

      expect(component.featureFlags().length).toBe(0);
      // there must be an <input> actually bound to the note FormControl
      const inputs = fixture.debugElement.queryAll(By.css('input'));
      const boundToNote = inputs.some(
        (el) => el.injector.get(NgControl, null)?.control === component.note,
      );
      expect(boundToNote).toBe(true);
    });

    it('should render the accept/discard buttons even when there are no feature entries', () => {
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });
  });

  describe('buildForm / validity', () => {
    it('should be invalid with no features', () => {
      fixture.detectChanges();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with at least one feature', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['feat-a']);
      expect(component.form.valid).toBe(true);
    });

    it('should be invalid when system exceeds 100 characters', () => {
      fixture.detectChanges();
      component.system.setValue('x'.repeat(101));
      expect(component.system.invalid).toBe(true);
    });

    it('should be invalid when type exceeds 100 characters', () => {
      fixture.detectChanges();
      component.type.setValue('x'.repeat(101));
      expect(component.type.invalid).toBe(true);
    });

    it('should be invalid when note exceeds 500 characters', () => {
      fixture.detectChanges();
      component.note.setValue('x'.repeat(501));
      expect(component.note.invalid).toBe(true);
    });
  });

  describe('updateForm (via ruling model effect)', () => {
    it('should reset the form when ruling is undefined', () => {
      fixture.componentRef.setInput('ruling', {
        features: ['feat-a'],
      } as CodFrRuling);
      fixture.detectChanges();

      fixture.componentRef.setInput('ruling', undefined);
      fixture.detectChanges();

      expect(component.features.value).toEqual([]);
    });

    it('should populate all controls from the data', () => {
      const ruling: CodFrRuling = {
        features: ['feat-a'],
        system: 'sys1',
        type: 'type1',
        note: 'a note',
      };

      fixture.componentRef.setInput('ruling', ruling);
      fixture.detectChanges();

      expect(component.features.value).toEqual(['feat-a']);
      expect(component.system.value).toBe('sys1');
      expect(component.type.value).toBe('type1');
      expect(component.note.value).toBe('a note');
      expect(component.form.pristine).toBe(true);
    });

    it('should default optional fields when absent', () => {
      fixture.componentRef.setInput('ruling', {
        features: ['feat-a'],
      } as CodFrRuling);
      fixture.detectChanges();

      expect(component.system.value).toBeNull();
      expect(component.type.value).toBeNull();
      expect(component.note.value).toBeNull();
    });
  });

  describe('onFeatureCheckedIdsChange', () => {
    it('should update features and mark dirty', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['feat-a']);
      expect(component.features.value).toEqual(['feat-a']);
      expect(component.features.dirty).toBe(true);
    });
  });

  describe('save', () => {
    it('should touch all controls and not update the model when invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.ruling()).toBeUndefined();
      expect(component.features.touched).toBe(true);
    });

    it('should build and set trimmed, minimal data when valid', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['feat-a']);
      component.system.setValue('  sys1  ');
      component.type.setValue('  type1  ');
      component.note.setValue('  a note  ');

      component.save();

      expect(component.ruling()).toEqual({
        features: ['feat-a'],
        system: 'sys1',
        type: 'type1',
        note: 'a note',
      });
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['feat-a']);

      component.save();

      expect(component.form.pristine).toBe(true);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['feat-a']);

      component.save(false);

      expect(component.form.pristine).toBe(false);
      expect(component.ruling()).toBeTruthy();
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
