import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { CodFrQuireLabelEditorComponent } from './cod-fr-quire-label-editor.component';
import { CodFrQuireLabel } from '../cod-fr-quire-labels-part';

@Component({
  selector: 'cadmus-refs-asserted-composite-id',
  template: '',
})
class MockAssertedCompositeIdComponent {
  public readonly idScopeEntries = input<unknown>();
  public readonly idTagEntries = input<unknown>();
  public readonly assTagEntries = input<unknown>();
  public readonly refTypeEntries = input<unknown>();
  public readonly refTagEntries = input<unknown>();
  public readonly featureEntries = input<unknown>();
  public readonly id = input<AssertedCompositeId | undefined>();
  public readonly canSwitchMode = input<boolean>();
  public readonly canEditTarget = input<boolean>();
  public readonly lookupProviderOptions = input<unknown>();
  public readonly idChange = output<AssertedCompositeId | undefined>();
}

describe('CodFrQuireLabelEditorComponent', () => {
  let component: CodFrQuireLabelEditorComponent;
  let fixture: ComponentFixture<CodFrQuireLabelEditorComponent>;

  const TYPE_ENTRIES: ThesaurusEntry[] = [{ id: 'type-a', value: 'Type A' }];
  const POSITION_ENTRIES: ThesaurusEntry[] = [
    { id: 'pos-a', value: 'Position A' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrQuireLabelEditorComponent],
      providers: [provideNoopAnimations()],
    })
      .overrideComponent(CodFrQuireLabelEditorComponent, {
        remove: { imports: [AssertedCompositeIdComponent] },
        add: { imports: [MockAssertedCompositeIdComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('typeFlags / positionFlags', () => {
    it('should map entries to flags', () => {
      fixture.componentRef.setInput('typeEntries', TYPE_ENTRIES);
      fixture.componentRef.setInput('positionEntries', POSITION_ENTRIES);
      fixture.detectChanges();

      expect(component.typeFlags()).toEqual([
        { id: 'type-a', label: 'Type A' },
      ]);
      expect(component.positionFlags()).toEqual([
        { id: 'pos-a', label: 'Position A' },
      ]);
    });

    it('should be empty arrays when no entries are provided', () => {
      fixture.detectChanges();
      expect(component.typeFlags()).toEqual([]);
      expect(component.positionFlags()).toEqual([]);
    });
  });

  describe('buildForm / validity', () => {
    it('should be invalid with no types or positions', () => {
      fixture.detectChanges();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with at least one type and one position', () => {
      fixture.detectChanges();
      component.onTypeCheckedIdsChange(['type-a']);
      component.onPositionCheckedIdsChange(['pos-a']);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('updateForm (via label model effect)', () => {
    it('should reset the form when label is undefined', () => {
      fixture.componentRef.setInput('label', {
        types: ['type-a'],
        positions: ['pos-a'],
      } as CodFrQuireLabel);
      fixture.detectChanges();

      fixture.componentRef.setInput('label', undefined);
      fixture.detectChanges();

      expect(component.types.value).toEqual([]);
      expect(component.positions.value).toEqual([]);
    });

    it('should populate all controls from the data', () => {
      const handId: AssertedCompositeId = { target: { gid: 'g1', label: 'L1' } };
      const label: CodFrQuireLabel = {
        types: ['type-a'],
        positions: ['pos-a'],
        text: 'a text',
        handId,
        ink: 'black',
        note: 'a note',
      };

      fixture.componentRef.setInput('label', label);
      fixture.detectChanges();

      expect(component.types.value).toEqual(['type-a']);
      expect(component.positions.value).toEqual(['pos-a']);
      expect(component.text.value).toBe('a text');
      expect(component.handId.value).toEqual(handId);
      expect(component.ink.value).toBe('black');
      expect(component.note.value).toBe('a note');
      expect(component.form.pristine).toBe(true);
    });

    it('should default optional fields when absent', () => {
      fixture.componentRef.setInput('label', {
        types: ['type-a'],
        positions: ['pos-a'],
      } as CodFrQuireLabel);
      fixture.detectChanges();

      expect(component.text.value).toBeNull();
      expect(component.handId.value).toBeNull();
      expect(component.ink.value).toBeNull();
      expect(component.note.value).toBeNull();
    });
  });

  describe('onXxxChange handlers', () => {
    it('onTypeCheckedIdsChange should update types and mark dirty', () => {
      fixture.detectChanges();
      component.onTypeCheckedIdsChange(['type-a']);
      expect(component.types.value).toEqual(['type-a']);
      expect(component.types.dirty).toBe(true);
    });

    it('onPositionCheckedIdsChange should update positions and mark dirty', () => {
      fixture.detectChanges();
      component.onPositionCheckedIdsChange(['pos-a']);
      expect(component.positions.value).toEqual(['pos-a']);
      expect(component.positions.dirty).toBe(true);
    });

    it('onHandIdChange should update handId and mark dirty', () => {
      fixture.detectChanges();
      const handId: AssertedCompositeId = { target: { gid: 'g1', label: 'L1' } };
      component.onHandIdChange(handId);
      expect(component.handId.value).toEqual(handId);
      expect(component.handId.dirty).toBe(true);
    });
  });

  describe('save', () => {
    it('should touch all controls and not update the model when invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.label()).toBeUndefined();
      expect(component.types.touched).toBe(true);
      expect(component.positions.touched).toBe(true);
    });

    it('should build and set trimmed, minimal data when valid', () => {
      fixture.detectChanges();
      component.onTypeCheckedIdsChange(['type-a']);
      component.onPositionCheckedIdsChange(['pos-a']);
      component.text.setValue('  a text  ');
      component.ink.setValue('  black  ');
      component.note.setValue('  a note  ');

      component.save();

      expect(component.label()).toEqual({
        types: ['type-a'],
        positions: ['pos-a'],
        text: 'a text',
        handId: undefined,
        ink: 'black',
        note: 'a note',
      });
    });

    it('should include handId when set', () => {
      fixture.detectChanges();
      component.onTypeCheckedIdsChange(['type-a']);
      component.onPositionCheckedIdsChange(['pos-a']);
      const handId: AssertedCompositeId = { target: { gid: 'g1', label: 'L1' } };
      component.onHandIdChange(handId);

      component.save();

      expect(component.label()?.handId).toEqual(handId);
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.onTypeCheckedIdsChange(['type-a']);
      component.onPositionCheckedIdsChange(['pos-a']);

      component.save();

      expect(component.form.pristine).toBe(true);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.onTypeCheckedIdsChange(['type-a']);
      component.onPositionCheckedIdsChange(['pos-a']);

      component.save(false);

      expect(component.form.pristine).toBe(false);
      expect(component.label()).toBeTruthy();
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
