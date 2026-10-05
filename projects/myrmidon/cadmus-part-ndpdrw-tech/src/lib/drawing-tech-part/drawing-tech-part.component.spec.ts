import { Component, input, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import {
  PhysicalMeasurement,
  PhysicalMeasurementSetComponent,
} from '@myrmidon/cadmus-mat-physical-size';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { DrawingTechPartComponent } from './drawing-tech-part.component';
import { DrawingTechPart } from '../drawing-tech-part';

// the form tags the objects in its arrays with a Symbol: compare plain copies
function json<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

@Component({
  selector: 'cadmus-mat-physical-measurement-set',
  template: '',
})
class MockPhysicalMeasurementSetComponent {
  public readonly measurements = model<PhysicalMeasurement[]>([]);
  public readonly nameEntries = input<unknown>();
  public readonly unitEntries = input<unknown>();
  public readonly dimTagEntries = input<unknown>();
}

describe('DrawingTechPartComponent', () => {
  let component: DrawingTechPartComponent;
  let fixture: ComponentFixture<DrawingTechPartComponent>;
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.drawing-tech',
    partId: 'part1',
    roleId: null,
  };

  function makeData(
    part: Partial<DrawingTechPart>,
    thesauri?: ThesauriSet,
  ): EditedObject<DrawingTechPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.drawing-tech',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        material: 'paper',
        ...part,
      },
      thesauri: thesauri || {},
    };
  }

  beforeEach(async () => {
    appRepository = {
      getSettingFor: vi.fn().mockResolvedValue(undefined),
      getTypeThesaurus: vi.fn().mockReturnValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [DrawingTechPartComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthJwtService,
          useValue: { currentUser$: of(null), currentUserValue: null },
        },
        { provide: AppRepository, useValue: appRepository },
      ],
    })
      .overrideComponent(DrawingTechPartComponent, {
        remove: { imports: [PhysicalMeasurementSetComponent] },
        add: { imports: [MockPhysicalMeasurementSetComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DrawingTechPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('flags computed signals', () => {
    it('should map thesauri entries to flags', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput(
        'data',
        makeData(
          {},
          {
            'drawing-tech-features': {
              id: 'drawing-tech-features',
              entries: [{ id: 'f1', value: 'F1' }],
            },
            'drawing-tech-techniques': {
              id: 'drawing-tech-techniques',
              entries: [{ id: 't1', value: 'T1' }],
            },
            'drawing-tech-colors': {
              id: 'drawing-tech-colors',
              entries: [{ id: 'c1', value: 'C1' }],
            },
          },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.featureFlags()).toEqual([{ id: 'f1', label: 'F1' }]);
      expect(component.techniqueFlags()).toEqual([{ id: 't1', label: 'T1' }]);
      expect(component.colorFlags()).toEqual([{ id: 'c1', label: 'C1' }]);
    });

    it('should be empty arrays when no thesauri are set', () => {
      fixture.detectChanges();
      expect(component.featureFlags()).toEqual([]);
      expect(component.techniqueFlags()).toEqual([]);
      expect(component.colorFlags()).toEqual([]);
    });
  });

  describe('buildForm / validity', () => {
    it('should be invalid when material is empty', () => {
      fixture.detectChanges();
      expect(component.form().invalid()).toBe(true);
    });

    it('should be valid when material is set', () => {
      fixture.detectChanges();
      component.form.material().value.set('paper');
      expect(component.form().valid()).toBe(true);
    });

    it('should be invalid when material exceeds 50 characters', () => {
      fixture.detectChanges();
      component.form.material().value.set('x'.repeat(51));
      expect(component.form.material().invalid()).toBe(true);
    });

    it('should be invalid when note exceeds 5000 characters', () => {
      fixture.detectChanges();
      component.form.material().value.set('paper');
      component.form.note().value.set('x'.repeat(5001));
      expect(component.form.note().invalid()).toBe(true);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should set an entries signal when its thesaurus is present', async () => {
      fixture.detectChanges();
      const entries = [{ id: 'm1', value: 'M1' }];

      fixture.componentRef.setInput(
        'data',
        makeData(
          {},
          {
            'drawing-tech-materials': { id: 'drawing-tech-materials', entries },
          },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.materialEntries()).toEqual(entries);
    });

    it('should clear an entries signal when its thesaurus is absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData({}, {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.materialEntries()).toBeUndefined();
      expect(component.sizeUnitEntries()).toBeUndefined();
      expect(component.dimTagEntries()).toBeUndefined();
      expect(component.measureNameEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      component.form.material().value.set('paper');

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.material().value()).toBe('');
    });

    it('should populate all controls from part data', async () => {
      const measures: PhysicalMeasurement[] = [
        { tag: 't', name: 'height', value: 1, unit: 'cm' },
      ];
      fixture.componentRef.setInput(
        'data',
        makeData({
          material: 'papyrus',
          features: ['f1'],
          measures,
          techniques: ['t1'],
          colors: ['c1'],
          note: 'a note',
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.material().value()).toBe('papyrus');
      expect(json(component.form.features().value())).toEqual(['f1']);
      expect(json(component.form.measures().value())).toEqual(measures);
      expect(json(component.form.techniques().value())).toEqual(['t1']);
      expect(json(component.form.colors().value())).toEqual(['c1']);
      expect(component.form.note().value()).toBe('a note');
      expect(component.form().dirty()).toBe(false);
    });

    it('should default optional fields to empty when absent', async () => {
      fixture.componentRef.setInput('data', makeData({ material: 'paper' }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(json(component.form.features().value())).toEqual([]);
      expect(json(component.form.measures().value())).toEqual([]);
      expect(json(component.form.techniques().value())).toEqual([]);
      expect(json(component.form.colors().value())).toEqual([]);
      expect(component.form.note().value()).toBe('');
    });
  });

  describe('getValue', () => {
    it('should return the edited part with current form values', async () => {
      fixture.componentRef.setInput('data', makeData({ material: 'paper' }));
      fixture.detectChanges();
      await fixture.whenStable();

      component.form.material().value.set('papyrus');
      component.onFeatureCheckedIdsChange(['f1']);
      component.onTechniqueCheckedIdsChange(['t1']);
      component.onColorCheckedIdsChange(['c1']);
      const measures: PhysicalMeasurement[] = [
        { tag: 't', name: 'height', value: 1, unit: 'cm' },
      ];
      component.onMeasuresChange(measures);
      component.form.note().value.set('  a note  ');

      const value = (component as any).getValue() as DrawingTechPart;

      expect(value.id).toBe('part1');
      expect(value.material).toBe('papyrus');
      expect(value.features).toEqual(['f1']);
      expect(value.techniques).toEqual(['t1']);
      expect(value.colors).toEqual(['c1']);
      expect(value.measures).toEqual(measures);
      expect(value.note).toBe('a note');
    });

    it('should return undefined for empty optional fields', async () => {
      fixture.componentRef.setInput('data', makeData({ material: 'paper' }));
      fixture.detectChanges();
      await fixture.whenStable();

      const value = (component as any).getValue() as DrawingTechPart;

      expect(value.features).toBeUndefined();
      expect(value.measures).toBeUndefined();
      expect(value.techniques).toBeUndefined();
      expect(value.colors).toBeUndefined();
      expect(value.note).toBeUndefined();
    });
  });

  describe('onXxxChange handlers', () => {
    it('onFeatureCheckedIdsChange should update features and mark dirty', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['f1']);
      expect(json(component.form.features().value())).toEqual(['f1']);
      expect(component.form.features().dirty()).toBe(true);
    });

    it('onTechniqueCheckedIdsChange should update techniques and mark dirty', () => {
      fixture.detectChanges();
      component.onTechniqueCheckedIdsChange(['t1']);
      expect(json(component.form.techniques().value())).toEqual(['t1']);
      expect(component.form.techniques().dirty()).toBe(true);
    });

    it('onColorCheckedIdsChange should update colors and mark dirty', () => {
      fixture.detectChanges();
      component.onColorCheckedIdsChange(['c1']);
      expect(json(component.form.colors().value())).toEqual(['c1']);
      expect(component.form.colors().dirty()).toBe(true);
    });

    it('onMeasuresChange should update measures and mark dirty', () => {
      fixture.detectChanges();
      const measures: PhysicalMeasurement[] = [
        { tag: 't', name: 'height', value: 1, unit: 'cm' },
      ];
      component.onMeasuresChange(measures);
      expect(json(component.form.measures().value())).toEqual(measures);
      expect(component.form.measures().dirty()).toBe(true);
    });
  });

  describe('save (inherited base behavior)', () => {
    it('should not update data when the form is invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.data()).toBeUndefined();
    });

    it('should update data when the form is valid', async () => {
      fixture.componentRef.setInput('data', makeData({ material: 'paper' }));
      fixture.detectChanges();
      await fixture.whenStable();
      component.form.material().value.set('papyrus');

      component.save();

      expect(component.data()?.value?.material).toBe('papyrus');
      expect(component.form().dirty()).toBe(false);
    });
  });

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });
  });

  describe('dirty state', () => {
    const MEASURES = [{ name: 'height', value: 10, unit: 'cm' }];

    async function bindSample(): Promise<void> {
      fixture.detectChanges();
      fixture.componentRef.setInput(
        'data',
        makeData({
          material: 'paper',
          features: ['f1'],
          measures: structuredClone(MEASURES),
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
    }

    it('should leave a newly bound part pristine', async () => {
      await bindSample();
      expect(component.isDirty()).toBe(false);
    });

    it('should stay pristine when children echo their bound values', async () => {
      await bindSample();

      component.onFeatureCheckedIdsChange(['f1']);
      component.onTechniqueCheckedIdsChange([]);
      component.onColorCheckedIdsChange([]);
      component.onMeasuresChange(structuredClone(MEASURES) as any);

      expect(component.isDirty()).toBe(false);
    });

    it('should save measures without the form Symbol tags', async () => {
      await bindSample();
      component.form.note().value.set('n');
      component.form.note().markAsDirty();

      component.save();

      const measures = component.data()!.value!.measures!;
      expect(measures).toEqual(MEASURES);
      expect(Object.getOwnPropertySymbols(measures[0])).toEqual([]);
      expect(component.isDirty()).toBe(false);
    });
  });
});
