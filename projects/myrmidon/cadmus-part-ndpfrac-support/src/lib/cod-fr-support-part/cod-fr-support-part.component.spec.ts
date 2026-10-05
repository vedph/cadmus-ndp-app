import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import {
  PhysicalGridCoordsService,
  PhysicalGridLocation,
  PhysicalGridLocationComponent,
} from '@myrmidon/cadmus-mat-physical-grid';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { CodFrSupportPartComponent } from './cod-fr-support-part.component';
import { CodFrSupportPart } from '../cod-fr-support-part';

// the form tags the objects in its arrays with a Symbol: compare plain copies
function json<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

@Component({
  selector: 'cadmus-mat-physical-grid-location',
  template: '',
})
class MockPhysicalGridLocationComponent {
  public readonly location = input<PhysicalGridLocation | undefined>();
  public readonly allowCustomSize = input<boolean>();
  public readonly allowResize = input<boolean>();
  public readonly locationChange = output<PhysicalGridLocation | undefined>();
}

describe('CodFrSupportPartComponent', () => {
  let component: CodFrSupportPartComponent;
  let fixture: ComponentFixture<CodFrSupportPartComponent>;
  let coordsService: PhysicalGridCoordsService;
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.cod-fr-support',
    partId: 'part1',
    roleId: null,
  };

  function makeData(
    part: Partial<CodFrSupportPart>,
    thesauri?: ThesauriSet,
  ): EditedObject<CodFrSupportPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.cod-fr-support',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        material: 'parchment',
        location: '',
        container: 'box 1',
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
      imports: [CodFrSupportPartComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthJwtService,
          useValue: { currentUser$: of(null), currentUserValue: null },
        },
        { provide: AppRepository, useValue: appRepository },
      ],
    })
      .overrideComponent(CodFrSupportPartComponent, {
        remove: { imports: [PhysicalGridLocationComponent] },
        add: { imports: [MockPhysicalGridLocationComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CodFrSupportPartComponent);
    component = fixture.componentInstance;
    coordsService = TestBed.inject(PhysicalGridCoordsService);
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('buildForm / validity', () => {
    it('should be invalid without a location', () => {
      fixture.detectChanges();
      expect(component.form.location().invalid()).toBe(true);
    });

    it('should be invalid when material exceeds 100 characters', () => {
      fixture.detectChanges();
      component.form.material().value.set('x'.repeat(101));
      expect(component.form.material().invalid()).toBe(true);
    });

    it('should be invalid when container exceeds 100 characters', () => {
      fixture.detectChanges();
      component.form.container().value.set('x'.repeat(101));
      expect(component.form.container().invalid()).toBe(true);
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
            'cod-fr-support-materials': {
              id: 'cod-fr-support-materials',
              entries,
            },
          },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.materialEntries()).toEqual(entries);
    });

    it('should clear entries signals when their thesauri are absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData({}, {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.materialEntries()).toBeUndefined();
      expect(component.reuseEntries()).toBeUndefined();
      expect(component.containerEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      component.form.material().value.set('parchment');

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.material().value()).toBe('');
    });

    it('should populate simple controls from part data', async () => {
      fixture.componentRef.setInput(
        'data',
        makeData({
          material: 'paper',
          container: 'box 2',
          reuse: 'palimpsest',
          supposedReuse: 'maybe',
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.material().value()).toBe('paper');
      expect(component.form.container().value()).toBe('box 2');
      expect(component.form.reuse().value()).toBe('palimpsest');
      expect(component.form.supposedReuse().value()).toBe('maybe');
      expect(component.form().dirty()).toBe(false);
    });

    it('should parse a valid location string into a grid location', async () => {
      const location: PhysicalGridLocation = {
        rows: 3,
        columns: 3,
        coords: [{ row: 1, column: 1 }],
      };
      const text = coordsService.physicalGridCoordsToString(location, true);

      fixture.componentRef.setInput('data', makeData({ location: text }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(json(component.form.location().value())).toEqual(
        coordsService.parsePhysicalGridCoords(text, 3, 3, true),
      );
    });

    it('should fall back to the first materialEntries id when material is empty', async () => {
      fixture.componentRef.setInput(
        'data',
        makeData(
          { material: '' },
          {
            'cod-fr-support-materials': {
              id: 'cod-fr-support-materials',
              entries: [{ id: 'default-mat', value: 'Default' }],
            },
          },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.material().value()).toBe('default-mat');
    });
  });

  describe('onLocationChange', () => {
    it('should update location and mark dirty', () => {
      fixture.detectChanges();
      const location: PhysicalGridLocation = {
        rows: 3,
        columns: 3,
        coords: [{ row: 1, column: 1 }],
      };

      component.onLocationChange(location);

      expect(json(component.form.location().value())).toEqual(location);
      expect(component.form.location().dirty()).toBe(true);
    });
  });

  describe('getValue', () => {
    it('should return the edited part with trimmed/derived fields', async () => {
      fixture.componentRef.setInput('data', makeData({}));
      fixture.detectChanges();
      await fixture.whenStable();

      component.form.material().value.set('paper');
      const location: PhysicalGridLocation = {
        rows: 3,
        columns: 3,
        coords: [{ row: 1, column: 1 }],
      };
      component.onLocationChange(location);
      component.form.container().value.set('  box 2  ');
      component.form.reuse().value.set('  palimpsest  ');
      component.form.supposedReuse().value.set('  maybe  ');

      const value = (component as any).getValue() as CodFrSupportPart;

      expect(value.material).toBe('paper');
      expect(value.location).toBe(
        coordsService.physicalGridCoordsToString(location),
      );
      expect(value.container).toBe('box 2');
      expect(value.reuse).toBe('palimpsest');
      expect(value.supposedReuse).toBe('maybe');
    });

    it('should return empty location and undefined reuse fields when unset', async () => {
      fixture.componentRef.setInput('data', makeData({}));
      fixture.detectChanges();
      await fixture.whenStable();
      component.form.material().value.set('paper');

      const value = (component as any).getValue() as CodFrSupportPart;

      expect(value.location).toBe('');
      expect(value.reuse).toBeUndefined();
      expect(value.supposedReuse).toBeUndefined();
    });
  });

  describe('draft and dirty state', () => {
    const THESAURI: ThesauriSet = {
      'cod-fr-support-materials': {
        id: 'cod-fr-support-materials',
        entries: [
          { id: 'paper', value: 'paper' },
          { id: 'parchment', value: 'parchment' },
        ],
      },
    };

    it('should default an empty material to the first entry, pristine', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput(
        'data',
        makeData({ material: '', location: 'a1' }, THESAURI),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.material().value()).toBe('paper');
      expect(component.isDirty()).toBe(false);
    });

    it('should not default the material of a new part', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', {
        value: undefined,
        thesauri: THESAURI,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.material().value()).toBe('');
    });

    it('should stay pristine when the grid echoes its bound location', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData({ location: 'a1' }));
      fixture.detectChanges();
      await fixture.whenStable();
      const location = component.form.location().value();
      expect(location).toBeTruthy();

      component.onLocationChange(structuredClone(location));

      expect(component.isDirty()).toBe(false);
    });
  });

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });
  });
});
