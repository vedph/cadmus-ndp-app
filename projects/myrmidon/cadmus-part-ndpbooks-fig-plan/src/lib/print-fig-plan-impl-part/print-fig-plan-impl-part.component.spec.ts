import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { PrintFigPlanImplPartComponent } from './print-fig-plan-impl-part.component';
import {
  FigPlanImplItem,
  PrintFigPlanImplPart,
} from '../print-fig-plan-impl-part';

describe('PrintFigPlanImplPartComponent', () => {
  let component: PrintFigPlanImplPartComponent;
  let fixture: ComponentFixture<PrintFigPlanImplPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.print-fig-plan-impl',
    partId: 'part1',
    roleId: null,
  };

  function makeItem(eid: string): FigPlanImplItem {
    return { eid, type: 'type-a' };
  }

  function makeData(
    part: Partial<PrintFigPlanImplPart>,
    thesauri?: ThesauriSet,
  ): EditedObject<PrintFigPlanImplPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.print-fig-plan-impl',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        techniques: ['t1'],
        ...part,
      },
      thesauri: thesauri || {},
    };
  }

  beforeEach(async () => {
    dialogService = { confirm: vi.fn() };
    appRepository = {
      getSettingFor: vi.fn().mockResolvedValue(undefined),
      getTypeThesaurus: vi.fn().mockReturnValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [PrintFigPlanImplPartComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthJwtService,
          useValue: { currentUser$: of(null), currentUserValue: null },
        },
        { provide: AppRepository, useValue: appRepository },
        { provide: DialogService, useValue: dialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrintFigPlanImplPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('techniqueFlags / featureFlags', () => {
    it('should map entries to flags', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput(
        'data',
        makeData(
          {},
          {
            'fig-plan-techniques': {
              id: 'fig-plan-techniques',
              entries: [{ id: 't1', value: 'T1' }],
            },
            'fig-plan-impl-features': {
              id: 'fig-plan-impl-features',
              entries: [{ id: 'f1', value: 'F1' }],
            },
          },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.techniqueFlags()).toEqual([{ id: 't1', label: 'T1' }]);
      expect(component.featureFlags()).toEqual([{ id: 'f1', label: 'F1' }]);
    });

    it('should be empty arrays with no entries', () => {
      fixture.detectChanges();
      expect(component.techniqueFlags()).toEqual([]);
      expect(component.featureFlags()).toEqual([]);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should set every entries signal when its thesaurus is present', async () => {
      fixture.detectChanges();
      const typeEntries = [{ id: 'type-a', value: 'Type A' }];
      fixture.componentRef.setInput(
        'data',
        makeData(
          {},
          { 'fig-plan-types': { id: 'fig-plan-types', entries: typeEntries } },
        ),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.typeEntries()).toEqual(typeEntries);
    });

    it('should clear entries signals when their thesauri are absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData({}, {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.typeEntries()).toBeUndefined();
      expect(component.idFeatureEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      component.description.setValue('a description');

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.description.value).toBeNull();
    });

    it('should populate all controls from part data', async () => {
      const items = [makeItem('e1')];

      fixture.componentRef.setInput(
        'data',
        makeData({
          isComplete: true,
          techniques: ['t1'],
          features: ['f1'],
          description: 'a description',
          items,
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.complete.value).toBe(true);
      expect(component.techniques.value).toEqual(['t1']);
      expect(component.features.value).toEqual(['f1']);
      expect(component.description.value).toBe('a description');
      expect(component.items.value).toEqual(items);
      expect(component.form.pristine).toBe(true);
    });

    it('should default complete to false when isComplete is falsy', async () => {
      fixture.componentRef.setInput('data', makeData({ isComplete: undefined }));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.complete.value).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the edited part with current form values', async () => {
      fixture.componentRef.setInput('data', makeData({}));
      fixture.detectChanges();
      await fixture.whenStable();

      component.complete.setValue(true);
      component.onTechniqueCheckedIdsChange(['t1']);
      component.onFeatureCheckedIdsChange(['f1']);
      component.description.setValue('  a description  ');
      component.saveItem(makeItem('e1'));

      const value = (component as any).getValue() as PrintFigPlanImplPart;

      expect(value.isComplete).toBe(true);
      expect(value.techniques).toEqual(['t1']);
      expect(value.features).toEqual(['f1']);
      expect(value.description).toBe('a description');
      expect(value.items).toEqual([makeItem('e1')]);
    });

    it('should return undefined description when empty', async () => {
      fixture.componentRef.setInput('data', makeData({}));
      fixture.detectChanges();
      await fixture.whenStable();

      const value = (component as any).getValue() as PrintFigPlanImplPart;

      expect(value.description).toBeUndefined();
      expect(value.items).toEqual([]);
    });
  });

  describe('addItem / editItem / closeItem', () => {
    it('addItem should default the type to the first typeEntries id', () => {
      fixture.componentRef.setInput(
        'data',
        makeData(
          {},
          {
            'fig-plan-types': {
              id: 'fig-plan-types',
              entries: [{ id: 'type-x', value: 'Type X' }],
            },
          },
        ),
      );
      fixture.detectChanges();

      component.addItem();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toEqual({ eid: '', type: 'type-x' });
    });

    it('addItem should default the type to an empty string with no typeEntries', () => {
      fixture.detectChanges();

      component.addItem();

      expect(component.edited()).toEqual({ eid: '', type: '' });
    });

    it('editItem should open the editor with a deep clone', () => {
      fixture.detectChanges();
      const item = makeItem('e1');

      component.editItem(item, 1);

      expect(component.editedIndex()).toBe(1);
      expect(component.edited()).toEqual(item);
      expect(component.edited()).not.toBe(item);
    });

    it('closeItem should reset edited/editedIndex', () => {
      fixture.detectChanges();
      component.editItem(makeItem('e1'), 0);

      component.closeItem();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  describe('saveItem', () => {
    it('should append a new item when editedIndex is -1', () => {
      fixture.detectChanges();
      component.items.setValue([makeItem('e1')]);
      component.addItem();

      component.saveItem(makeItem('e2'));

      expect(component.items.value).toEqual([makeItem('e1'), makeItem('e2')]);
      expect(component.items.dirty).toBe(true);
      expect(component.editedIndex()).toBe(-1);
    });

    it('should replace the item at editedIndex when editing an existing one', () => {
      fixture.detectChanges();
      component.items.setValue([makeItem('e1'), makeItem('e2')]);
      component.editItem(makeItem('e2'), 1);

      component.saveItem({ eid: 'e2', type: 'type-b' });

      expect(component.items.value).toEqual([
        makeItem('e1'),
        { eid: 'e2', type: 'type-b' },
      ]);
    });
  });

  describe('deleteItem', () => {
    it('should remove the item when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.items.setValue([makeItem('e1'), makeItem('e2')]);

      component.deleteItem(0);

      expect(component.items.value).toEqual([makeItem('e2')]);
    });

    it('should not remove the item when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      component.items.setValue([makeItem('e1')]);

      component.deleteItem(0);

      expect(component.items.value).toEqual([makeItem('e1')]);
    });

    it('should close the editor when deleting the currently edited item', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.items.setValue([makeItem('e1')]);
      component.editItem(makeItem('e1'), 0);

      component.deleteItem(0);

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  // moveItemUp/moveItemDown: regression tests for the editedIndex desync
  // bug found and fixed across this and sibling libraries, plus the
  // reference-equality "selected" template bug fixed alongside it.
  describe('moveItemUp', () => {
    it('should do nothing when index is 0', () => {
      fixture.detectChanges();
      const items = [makeItem('e1'), makeItem('e2')];
      component.items.setValue(items);

      component.moveItemUp(0);

      expect(component.items.value).toEqual(items);
      expect(component.items.dirty).toBe(false);
    });

    it('should swap the item with the previous one and keep editedIndex tracking it', () => {
      fixture.detectChanges();
      component.items.setValue([makeItem('e1'), makeItem('e2')]);
      component.editItem(makeItem('e2'), 1);

      component.moveItemUp(1);

      expect(component.items.value).toEqual([makeItem('e2'), makeItem('e1')]);
      expect(component.editedIndex()).toBe(0);
    });

    it('should keep editedIndex tracking the displaced item', () => {
      fixture.detectChanges();
      component.items.setValue([makeItem('e1'), makeItem('e2')]);
      component.editItem(makeItem('e1'), 0);

      component.moveItemUp(1);

      expect(component.editedIndex()).toBe(1);
    });
  });

  describe('moveItemDown', () => {
    it('should do nothing when index is the last one', () => {
      fixture.detectChanges();
      const items = [makeItem('e1'), makeItem('e2')];
      component.items.setValue(items);

      component.moveItemDown(1);

      expect(component.items.value).toEqual(items);
      expect(component.items.dirty).toBe(false);
    });

    it('should swap the item with the next one and keep editedIndex tracking it', () => {
      fixture.detectChanges();
      component.items.setValue([makeItem('e1'), makeItem('e2')]);
      component.editItem(makeItem('e1'), 0);

      component.moveItemDown(0);

      expect(component.items.value).toEqual([makeItem('e2'), makeItem('e1')]);
      expect(component.editedIndex()).toBe(1);
    });

    it('should keep editedIndex tracking the displaced item', () => {
      fixture.detectChanges();
      component.items.setValue([makeItem('e1'), makeItem('e2')]);
      component.editItem(makeItem('e2'), 1);

      component.moveItemDown(0);

      expect(component.editedIndex()).toBe(0);
    });
  });
});
