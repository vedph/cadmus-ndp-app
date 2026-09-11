import { Component, input, model, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { PhysicalDimension } from '@myrmidon/cadmus-mat-physical-size';
import {
  DecoratedCount,
  DecoratedCountsComponent,
} from '@myrmidon/cadmus-refs-decorated-counts';
import {
  CodLayoutFormulaComponent,
  CodLayoutFormulaWithDimensions,
} from '@myrmidon/cadmus-codicology-ui';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { CodFrLayoutPartComponent } from './cod-fr-layout-part.component';
import { CodFrLayoutPart } from '../cod-fr-layout-part';

@Component({
  selector: 'cadmus-cod-layout-formula',
  template: '',
})
class MockCodLayoutFormulaComponent {
  public readonly data = model<CodLayoutFormulaWithDimensions | undefined>();
  public readonly unitEntries = input<unknown>();
  public readonly tagEntries = input<unknown>();
  public readonly cancelEdit = output<void>();
}

@Component({
  selector: 'cadmus-refs-decorated-counts',
  template: '',
})
class MockDecoratedCountsComponent {
  public readonly counts = model<DecoratedCount[] | undefined>();
  public readonly idEntries = input<unknown>();
  public readonly tagEntries = input<unknown>();
}

describe('CodFrLayoutPartComponent', () => {
  let component: CodFrLayoutPartComponent;
  let fixture: ComponentFixture<CodFrLayoutPartComponent>;
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.cod-fr-layout',
    partId: 'part1',
    roleId: null,
  };

  function makeData(
    part: Partial<CodFrLayoutPart>,
    thesauri?: ThesauriSet,
  ): EditedObject<CodFrLayoutPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.cod-fr-layout',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        formula: 'BO 1 = 2',
        columnCount: 1,
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
      imports: [CodFrLayoutPartComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthJwtService,
          useValue: { currentUser$: of(null), currentUserValue: null },
        },
        { provide: AppRepository, useValue: appRepository },
      ],
    })
      .overrideComponent(CodFrLayoutPartComponent, {
        remove: { imports: [CodLayoutFormulaComponent, DecoratedCountsComponent] },
        add: {
          imports: [MockCodLayoutFormulaComponent, MockDecoratedCountsComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrLayoutPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('featureFlags', () => {
    it('should map featureEntries to flags', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput(
        'data',
        makeData(
          {},
          {
            'cod-fr-layout-features': {
              id: 'cod-fr-layout-features',
              entries: [{ id: 'f1', value: 'F1' }],
            },
          },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.featureFlags()).toEqual([{ id: 'f1', label: 'F1' }]);
    });

    it('should be an empty array when no featureEntries are set', () => {
      fixture.detectChanges();
      expect(component.featureFlags()).toEqual([]);
    });
  });

  describe('buildForm / validity', () => {
    it('should be invalid when formula is empty', () => {
      fixture.detectChanges();
      expect(component.formula.invalid).toBe(true);
    });

    it('should be invalid when columnCount is less than 1', () => {
      fixture.detectChanges();
      component.formula.setValue('BO 1 = 2');
      component.columnCount.setValue(0);
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with formula and columnCount set', () => {
      fixture.detectChanges();
      component.formula.setValue('BO 1 = 2');
      component.columnCount.setValue(1);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should fall back to DEFAULT_UNITS when physical-size-units is absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData({}, {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.unitEntries()).toEqual([
        { id: 'mm', value: 'mm' },
        { id: 'cm', value: 'cm' },
      ]);
    });

    it('should use physical-size-units entries when present', async () => {
      fixture.detectChanges();
      const units = [{ id: 'in', value: 'in' }];
      fixture.componentRef.setInput(
        'data',
        makeData(
          {},
          { 'physical-size-units': { id: 'physical-size-units', entries: units } },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.unitEntries()).toEqual(units);
    });

    it('should clear dimTagEntries when its thesaurus is absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData({}, {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.dimTagEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form and formulaData when data value is falsy', async () => {
      fixture.detectChanges();
      component.formula.setValue('BO 1 = 2');

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.formula.value).toBe('');
      expect(component.formulaData()).toEqual({
        prefix: 'BO',
        formula: '',
        dimensions: [],
      });
    });

    it('should populate all controls and formulaData from part data', async () => {
      const dimensions: PhysicalDimension[] = [
        { tag: 'height', value: 10, unit: 'mm' },
      ];
      const counts: DecoratedCount[] = [{ id: 'c1', value: 3 }];

      fixture.componentRef.setInput(
        'data',
        makeData({
          formula: 'IT 1 = 2',
          dimensions,
          pricking: 'p1',
          columnCount: 2,
          features: ['f1'],
          counts,
          note: 'a note',
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.formula.value).toBe('IT 1 = 2');
      expect(component.dimensions.value).toEqual(dimensions);
      expect(component.pricking.value).toBe('p1');
      expect(component.columnCount.value).toBe(2);
      expect(component.features.value).toEqual(['f1']);
      expect(component.counts.value).toEqual(counts);
      expect(component.note.value).toBe('a note');
      expect(component.formulaData()).toEqual({
        prefix: 'IT',
        formula: 'IT 1 = 2',
        dimensions,
      });
      expect(component.form.pristine).toBe(true);
    });

    it('should default the formulaData prefix to BO when the formula has no recognizable prefix', async () => {
      fixture.componentRef.setInput('data', makeData({ formula: '' }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.formulaData().prefix).toBe('BO');
    });
  });

  describe('getValue', () => {
    it('should return the edited part with trimmed/derived fields', async () => {
      fixture.componentRef.setInput('data', makeData({}));
      fixture.detectChanges();
      await fixture.whenStable();

      component.formula.setValue('  BO 1 = 2  ');
      component.pricking.setValue('  p1  ');
      component.columnCount.setValue(3);
      component.onFeatureCheckedIdsChange(['f1']);
      const counts: DecoratedCount[] = [{ id: 'c1', value: 1 }];
      component.onCountsChange(counts);
      component.note.setValue('  a note  ');

      const value = (component as any).getValue() as CodFrLayoutPart;

      expect(value.formula).toBe('BO 1 = 2');
      expect(value.pricking).toBe('p1');
      expect(value.columnCount).toBe(3);
      expect(value.features).toEqual(['f1']);
      expect(value.counts).toEqual(counts);
      expect(value.note).toBe('a note');
    });

    it('should return undefined for empty optional fields', async () => {
      fixture.componentRef.setInput('data', makeData({}));
      fixture.detectChanges();
      await fixture.whenStable();
      component.formula.setValue('BO 1 = 2');

      const value = (component as any).getValue() as CodFrLayoutPart;

      expect(value.dimensions).toBeUndefined();
      expect(value.pricking).toBeUndefined();
      expect(value.features).toBeUndefined();
      expect(value.counts).toBeUndefined();
      expect(value.note).toBeUndefined();
    });
  });

  describe('onFeatureCheckedIdsChange / onCountsChange', () => {
    it('onFeatureCheckedIdsChange should update features and mark dirty', () => {
      fixture.detectChanges();
      component.onFeatureCheckedIdsChange(['f1']);
      expect(component.features.value).toEqual(['f1']);
      expect(component.features.dirty).toBe(true);
    });

    it('onCountsChange should update counts and mark dirty', () => {
      fixture.detectChanges();
      const counts: DecoratedCount[] = [{ id: 'c1', value: 1 }];
      component.onCountsChange(counts);
      expect(component.counts.value).toEqual(counts);
      expect(component.counts.dirty).toBe(true);
    });
  });

  // regression test: onFormulaDataChange used to update only the formula
  // control, silently dropping any dimensions the user edited in the
  // layout formula editor, so they were never saved.
  describe('onFormulaDataChange', () => {
    it('should update formulaData, formula and dimensions controls', () => {
      fixture.detectChanges();
      const dimensions: PhysicalDimension[] = [
        { tag: 'height', value: 20, unit: 'mm' },
      ];
      const data: CodLayoutFormulaWithDimensions = {
        prefix: 'IT',
        formula: 'IT 1 = 2',
        dimensions,
      };

      component.onFormulaDataChange(data);

      expect(component.formulaData()).toEqual(data);
      expect(component.formula.value).toBe('IT 1 = 2');
      expect(component.formula.dirty).toBe(true);
      expect(component.dimensions.value).toEqual(dimensions);
      expect(component.dimensions.dirty).toBe(true);
    });

    it('should be reflected in getValue()', () => {
      fixture.detectChanges();
      const dimensions: PhysicalDimension[] = [
        { tag: 'width', value: 15, unit: 'cm' },
      ];

      component.onFormulaDataChange({
        prefix: 'BO',
        formula: 'BO 1 = 2',
        dimensions,
      });

      const value = (component as any).getValue() as CodFrLayoutPart;
      expect(value.dimensions).toEqual(dimensions);
    });
  });
});
