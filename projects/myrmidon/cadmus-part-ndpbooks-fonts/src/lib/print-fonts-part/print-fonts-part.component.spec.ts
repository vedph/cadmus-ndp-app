import { Component, input, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { AppRepository } from '@myrmidon/cadmus-state';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { EditedObject, PartIdentity, ThesauriSet } from '@myrmidon/cadmus-core';

import { PrintFontsPartComponent } from './print-fonts-part.component';
import { PrintFontEditorComponent } from '../print-font-editor/print-font-editor.component';
import { PrintFont, PrintFontsPart } from '../print-fonts-part';

@Component({
  selector: 'cadmus-print-font-editor',
  template: '',
})
class MockPrintFontEditorComponent {
  public readonly familyEntries = input<unknown>();
  public readonly font = model<PrintFont | undefined>();
}

describe('PrintFontsPartComponent', () => {
  let component: PrintFontsPartComponent;
  let fixture: ComponentFixture<PrintFontsPartComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };
  let appRepository: {
    getSettingFor: ReturnType<typeof vi.fn>;
    getTypeThesaurus: ReturnType<typeof vi.fn>;
  };

  const IDENTITY: PartIdentity = {
    itemId: 'item1',
    typeId: 'it.vedph.ndp.print-fonts',
    partId: 'part1',
    roleId: null,
  };

  function makeFont(family: string): PrintFont {
    return { family };
  }

  function makeData(
    fonts: PrintFont[],
    thesauri?: ThesauriSet,
  ): EditedObject<PrintFontsPart> {
    return {
      value: {
        id: 'part1',
        itemId: 'item1',
        typeId: 'it.vedph.ndp.print-fonts',
        timeCreated: new Date(0),
        creatorId: 'u',
        timeModified: new Date(0),
        userId: 'u',
        fonts,
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
      imports: [PrintFontsPartComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthJwtService,
          useValue: { currentUser$: of(null), currentUserValue: null },
        },
        { provide: AppRepository, useValue: appRepository },
        { provide: DialogService, useValue: dialogService },
      ],
    })
      .overrideComponent(PrintFontsPartComponent, {
        remove: { imports: [PrintFontEditorComponent] },
        add: { imports: [MockPrintFontEditorComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PrintFontsPartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identity', IDENTITY);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('buildForm / validity', () => {
    it('should be invalid with no fonts', () => {
      fixture.detectChanges();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with at least one font', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times')]);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('onDataSet (thesauri)', () => {
    it('should set entries signals when their thesauri are present', async () => {
      fixture.detectChanges();
      const thesauri: ThesauriSet = {
        'print-font-families': {
          id: 'print-font-families',
          entries: [{ id: 'f1', value: 'F1' }],
        },
        'print-layout-sections': {
          id: 'print-layout-sections',
          entries: [{ id: 's1', value: 'S1' }],
        },
      };

      fixture.componentRef.setInput('data', makeData([], thesauri));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.familyEntries()).toEqual(
        thesauri['print-font-families'].entries,
      );
      expect(component.sectionEntries()).toEqual(
        thesauri['print-layout-sections'].entries,
      );
      expect(component.featureEntries()).toBeUndefined();
    });

    it('should clear entries signals when their thesauri are absent', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([], {}));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.familyEntries()).toBeUndefined();
      expect(component.idFeatureEntries()).toBeUndefined();
    });
  });

  describe('onDataSet (settings)', () => {
    it('should set lookupProviderOptions from the app repository settings', async () => {
      const options = { providers: [] };
      appRepository.getSettingFor.mockResolvedValue({
        lookupProviderOptions: options,
      });
      fixture.detectChanges();

      fixture.componentRef.setInput('data', makeData([]));
      fixture.detectChanges();
      await fixture.whenStable();
      await Promise.resolve();

      expect(appRepository.getSettingFor).toHaveBeenCalledWith(
        'it.vedph.ndp.print-fonts',
        undefined,
      );
      expect(component.lookupProviderOptions()).toEqual(options);
    });
  });

  describe('onDataSet (form)', () => {
    it('should reset the form when data value is falsy', async () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times')]);

      fixture.componentRef.setInput('data', { value: undefined, thesauri: {} });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.fonts.value).toEqual([]);
    });

    it('should populate fonts from part.fonts and mark the form pristine', async () => {
      fixture.detectChanges();
      const fonts = [makeFont('Times'), makeFont('Arial')];

      fixture.componentRef.setInput('data', makeData(fonts));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.fonts.value).toEqual(fonts);
      expect(component.form.pristine).toBe(true);
    });
  });

  describe('getValue', () => {
    it('should return the edited part with current fonts', async () => {
      fixture.detectChanges();
      fixture.componentRef.setInput('data', makeData([makeFont('Times')]));
      fixture.detectChanges();
      await fixture.whenStable();

      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);
      const value = (component as any).getValue() as PrintFontsPart;

      expect(value.id).toBe('part1');
      expect(value.fonts).toEqual([makeFont('Times'), makeFont('Arial')]);
    });
  });

  describe('addFont / editFont / closeFont', () => {
    it('should open the editor for a new empty font', () => {
      fixture.detectChanges();

      component.addFont();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toEqual({ family: '' });
    });

    it('should open the editor for an existing font as a deep clone', () => {
      fixture.detectChanges();
      const font = makeFont('Times');

      component.editFont(font, 2);

      expect(component.editedIndex()).toBe(2);
      expect(component.edited()).toEqual(font);
      expect(component.edited()).not.toBe(font);
    });

    it('should close the editor', () => {
      fixture.detectChanges();
      component.editFont(makeFont('Times'), 0);

      component.closeFont();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  describe('saveFont', () => {
    it('should append a new font when editedIndex is -1', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times')]);
      component.addFont();

      component.saveFont(makeFont('Arial'));

      expect(component.fonts.value).toEqual([
        makeFont('Times'),
        makeFont('Arial'),
      ]);
      expect(component.fonts.dirty).toBe(true);
      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });

    it('should replace the font at editedIndex when editing an existing one', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);
      component.editFont(makeFont('Arial'), 1);

      component.saveFont(makeFont('Arial (edited)'));

      expect(component.fonts.value).toEqual([
        makeFont('Times'),
        makeFont('Arial (edited)'),
      ]);
    });
  });

  describe('deleteFont', () => {
    it('should remove the font when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);

      component.deleteFont(0);

      expect(component.fonts.value).toEqual([makeFont('Arial')]);
      expect(component.fonts.dirty).toBe(true);
    });

    it('should not remove the font when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      component.fonts.setValue([makeFont('Times')]);

      component.deleteFont(0);

      expect(component.fonts.value).toEqual([makeFont('Times')]);
    });

    it('should close the editor when deleting the currently edited font', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.fonts.setValue([makeFont('Times')]);
      component.editFont(makeFont('Times'), 0);

      component.deleteFont(0);

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });
  });

  // moveFontUp/moveFontDown: regression tests for the same editedIndex
  // desync bug found and fixed in NotableWordFormsPartComponent.
  describe('moveFontUp', () => {
    it('should do nothing when index is 0', () => {
      fixture.detectChanges();
      const fonts = [makeFont('Times'), makeFont('Arial')];
      component.fonts.setValue(fonts);

      component.moveFontUp(0);

      expect(component.fonts.value).toEqual(fonts);
      expect(component.fonts.dirty).toBe(false);
    });

    it('should swap the font with the previous one', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);

      component.moveFontUp(1);

      expect(component.fonts.value).toEqual([
        makeFont('Arial'),
        makeFont('Times'),
      ]);
    });

    it('should keep editedIndex tracking the moved-up font', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);
      component.editFont(makeFont('Arial'), 1);

      component.moveFontUp(1);

      expect(component.editedIndex()).toBe(0);
    });

    it('should keep editedIndex tracking the displaced font', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);
      component.editFont(makeFont('Times'), 0);

      component.moveFontUp(1);

      expect(component.editedIndex()).toBe(1);
    });
  });

  describe('moveFontDown', () => {
    it('should do nothing when index is the last one', () => {
      fixture.detectChanges();
      const fonts = [makeFont('Times'), makeFont('Arial')];
      component.fonts.setValue(fonts);

      component.moveFontDown(1);

      expect(component.fonts.value).toEqual(fonts);
      expect(component.fonts.dirty).toBe(false);
    });

    it('should swap the font with the next one', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);

      component.moveFontDown(0);

      expect(component.fonts.value).toEqual([
        makeFont('Arial'),
        makeFont('Times'),
      ]);
    });

    it('should keep editedIndex tracking the moved-down font', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);
      component.editFont(makeFont('Times'), 0);

      component.moveFontDown(0);

      expect(component.editedIndex()).toBe(1);
    });

    it('should keep editedIndex tracking the displaced font', () => {
      fixture.detectChanges();
      component.fonts.setValue([makeFont('Times'), makeFont('Arial')]);
      component.editFont(makeFont('Arial'), 1);

      component.moveFontDown(0);

      expect(component.editedIndex()).toBe(0);
    });
  });
});
