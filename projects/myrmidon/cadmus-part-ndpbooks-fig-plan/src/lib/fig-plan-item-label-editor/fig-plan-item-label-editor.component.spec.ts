import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DialogService } from '@myrmidon/ngx-mat-tools';
import { PrintFont } from '@myrmidon/cadmus-part-ndpbooks-fonts';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { FigPlanItemLabelEditorComponent } from './fig-plan-item-label-editor.component';
import { FigPlanItemLabel } from '../print-fig-plan-impl-part';

// the form tags the objects in its arrays with a Symbol: compare plain copies
function json<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

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

describe('FigPlanItemLabelEditorComponent', () => {
  let component: FigPlanItemLabelEditorComponent;
  let fixture: ComponentFixture<FigPlanItemLabelEditorComponent>;
  let dialogService: { confirm: ReturnType<typeof vi.fn> };

  const LANGUAGE_ENTRIES: ThesaurusEntry[] = [{ id: 'lat', value: 'Latin' }];

  beforeEach(async () => {
    dialogService = { confirm: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [FigPlanItemLabelEditorComponent],
      providers: [
        provideNoopAnimations(),
        { provide: DialogService, useValue: dialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FigPlanItemLabelEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('languageFlags', () => {
    it('should map entries to flags', () => {
      fixture.componentRef.setInput('languageEntries', LANGUAGE_ENTRIES);
      fixture.detectChanges();
      expect(component.languageFlags()).toEqual([
        { id: 'lat', label: 'Latin' },
      ]);
    });

    it('should be an empty array when no entries are provided', () => {
      fixture.detectChanges();
      expect(component.languageFlags()).toEqual([]);
    });
  });

  describe('buildForm / validity', () => {
    it('should be invalid without a type', () => {
      fixture.detectChanges();
      expect(component.form.type().invalid()).toBe(true);
    });

    it('should require at least one font', () => {
      fixture.detectChanges();
      component.form.type().value.set('legend');
      expect(component.form.fonts().invalid()).toBe(true);
      expect(component.form().invalid()).toBe(true);
    });

    it('should be valid with a type and at least one font set', () => {
      fixture.detectChanges();
      component.form.type().value.set('legend');
      component.saveFont({ family: 'Times' });
      expect(component.form().valid()).toBe(true);
    });

    it('should be invalid when type exceeds 100 characters', () => {
      fixture.detectChanges();
      component.form.type().value.set('x'.repeat(101));
      expect(component.form.type().invalid()).toBe(true);
    });

    it('should be invalid when value exceeds 500 characters', () => {
      fixture.detectChanges();
      component.form.value().value.set('x'.repeat(501));
      expect(component.form.value().invalid()).toBe(true);
    });

    it('should be invalid when note exceeds 1000 characters', () => {
      fixture.detectChanges();
      component.form.note().value.set('x'.repeat(1001));
      expect(component.form.note().invalid()).toBe(true);
    });
  });

  describe('binding the model (via label model effect)', () => {
    it('should reset the form when label is undefined', () => {
      fixture.componentRef.setInput('label', {
        type: 'legend',
      } as FigPlanItemLabel);
      fixture.detectChanges();

      fixture.componentRef.setInput('label', undefined);
      fixture.detectChanges();

      expect(component.form.type().value()).toBe('');
    });

    it('should populate all controls from the data', () => {
      const fonts: PrintFont[] = [{ family: 'Times' }];
      const label: FigPlanItemLabel = {
        type: 'legend',
        languages: ['lat'],
        value: 'a value',
        note: 'a note',
        fonts,
      };

      fixture.componentRef.setInput('label', label);
      fixture.detectChanges();

      expect(component.form.type().value()).toBe('legend');
      expect(json(component.form.languages().value())).toEqual(['lat']);
      expect(component.form.value().value()).toBe('a value');
      expect(component.form.note().value()).toBe('a note');
      expect(json(component.form.fonts().value())).toEqual(fonts);
      expect(component.form().dirty()).toBe(false);
    });

    it('should default optional fields when absent', () => {
      fixture.componentRef.setInput('label', {
        type: 'legend',
      } as FigPlanItemLabel);
      fixture.detectChanges();

      expect(json(component.form.languages().value())).toEqual([]);
      expect(component.form.value().value()).toBe('');
      expect(component.form.note().value()).toBe('');
      expect(json(component.form.fonts().value())).toEqual([]);
    });
  });

  describe('onLanguageIdsChange', () => {
    it('should update languages and mark dirty', () => {
      fixture.detectChanges();
      component.onLanguageIdsChange(['lat']);
      expect(json(component.form.languages().value())).toEqual(['lat']);
      expect(component.form.languages().dirty()).toBe(true);
    });
  });

  describe('font CRUD', () => {
    function makeFont(family: string): PrintFont {
      return { family };
    }

    it('addFont should open the editor for a new empty font', () => {
      fixture.detectChanges();

      component.addFont();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toEqual({ family: '' });
    });

    it('editFont should open the editor with a deep clone', () => {
      fixture.detectChanges();
      const font = makeFont('Times');

      component.editFont(font, 1);

      expect(component.editedIndex()).toBe(1);
      expect(component.edited()).toEqual(font);
      expect(component.edited()).not.toBe(font);
    });

    it('closeFont should reset edited/editedIndex', () => {
      fixture.detectChanges();
      component.editFont(makeFont('Times'), 0);

      component.closeFont();

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });

    it('saveFont should append a new font when editedIndex is -1', () => {
      fixture.detectChanges();
      component.form.fonts().value.set([makeFont('Times')]);
      component.addFont();

      component.saveFont(makeFont('Arial'));

      expect(json(component.form.fonts().value())).toEqual([
        makeFont('Times'),
        makeFont('Arial'),
      ]);
      expect(component.form.fonts().dirty()).toBe(true);
      expect(component.editedIndex()).toBe(-1);
    });

    it('saveFont should replace the font at editedIndex when editing', () => {
      fixture.detectChanges();
      component.form.fonts().value.set([makeFont('Times'), makeFont('Arial')]);
      component.editFont(makeFont('Arial'), 1);

      component.saveFont(makeFont('Arial2'));

      expect(json(component.form.fonts().value())).toEqual([
        makeFont('Times'),
        makeFont('Arial2'),
      ]);
    });

    it('deleteFont should remove the font when the user confirms', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.form.fonts().value.set([makeFont('Times'), makeFont('Arial')]);

      component.deleteFont(0);

      expect(json(component.form.fonts().value())).toEqual([makeFont('Arial')]);
    });

    it('deleteFont should not remove the font when the user cancels', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(false));
      component.form.fonts().value.set([makeFont('Times')]);

      component.deleteFont(0);

      expect(json(component.form.fonts().value())).toEqual([makeFont('Times')]);
    });

    it('deleteFont should close the editor when deleting the edited font', () => {
      fixture.detectChanges();
      dialogService.confirm.mockReturnValue(of(true));
      component.form.fonts().value.set([makeFont('Times')]);
      component.editFont(makeFont('Times'), 0);

      component.deleteFont(0);

      expect(component.editedIndex()).toBe(-1);
      expect(component.edited()).toBeUndefined();
    });

    // regression tests for the editedIndex desync bug found and fixed in
    // this and sibling libraries, plus the reference-equality "selected"
    // template bug fixed alongside it.
    describe('moveFontUp / moveFontDown', () => {
      it('moveFontUp should keep editedIndex tracking the moved-up font', () => {
        fixture.detectChanges();
        component.form
          .fonts()
          .value.set([makeFont('Times'), makeFont('Arial')]);
        component.editFont(makeFont('Arial'), 1);

        component.moveFontUp(1);

        expect(json(component.form.fonts().value())).toEqual([
          makeFont('Arial'),
          makeFont('Times'),
        ]);
        expect(component.editedIndex()).toBe(0);
      });

      it('moveFontUp should keep editedIndex tracking the displaced font', () => {
        fixture.detectChanges();
        component.form
          .fonts()
          .value.set([makeFont('Times'), makeFont('Arial')]);
        component.editFont(makeFont('Times'), 0);

        component.moveFontUp(1);

        expect(component.editedIndex()).toBe(1);
      });

      it('moveFontDown should keep editedIndex tracking the moved-down font', () => {
        fixture.detectChanges();
        component.form
          .fonts()
          .value.set([makeFont('Times'), makeFont('Arial')]);
        component.editFont(makeFont('Times'), 0);

        component.moveFontDown(0);

        expect(json(component.form.fonts().value())).toEqual([
          makeFont('Arial'),
          makeFont('Times'),
        ]);
        expect(component.editedIndex()).toBe(1);
      });

      it('moveFontDown should keep editedIndex tracking the displaced font', () => {
        fixture.detectChanges();
        component.form
          .fonts()
          .value.set([makeFont('Times'), makeFont('Arial')]);
        component.editFont(makeFont('Arial'), 1);

        component.moveFontDown(0);

        expect(component.editedIndex()).toBe(0);
      });

      it('should do nothing at the boundaries', () => {
        fixture.detectChanges();
        const fonts = [makeFont('Times'), makeFont('Arial')];
        component.form.fonts().value.set(fonts);

        component.moveFontUp(0);
        component.moveFontDown(1);

        expect(json(component.form.fonts().value())).toEqual(fonts);
        expect(component.form.fonts().dirty()).toBe(false);
      });
    });
  });

  describe('save', () => {
    it('should touch all controls and not update the model when invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.label()).toBeUndefined();
      expect(component.form.type().touched()).toBe(true);
    });

    it('should build data with fonts included when valid', () => {
      fixture.detectChanges();
      component.form.type().value.set('legend');
      component.form.value().value.set('a value');
      component.form.note().value.set('a note');
      component.saveFont({ family: 'Times' });

      component.save();

      expect(component.label()).toEqual({
        type: 'legend',
        languages: [],
        value: 'a value',
        note: 'a note',
        fonts: [{ family: 'Times' }],
      });
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.saveFont({ family: 'Times' });
      component.form.type().value.set('legend');

      component.save();

      expect(component.form().dirty()).toBe(false);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.form.type().value.set('legend');
      component.saveFont({ family: 'Times' });
      component.form.type().markAsDirty();

      component.save(false);

      expect(component.form().dirty()).toBe(true);
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

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('should close the font editor on its Discard button', async () => {
      fixture.detectChanges();
      component.editFont({ family: 'Times' } as PrintFont, 0);
      fixture.detectChanges();
      await fixture.whenStable();
      const host: HTMLElement = fixture.nativeElement.querySelector(
        'cadmus-print-font-editor',
      );
      expect(host).toBeTruthy();

      discardButtonOf(host).click();
      fixture.detectChanges();

      expect(component.edited()).toBeUndefined();
      expect(component.editedIndex()).toBe(-1);
      expect(
        fixture.nativeElement.querySelector('cadmus-print-font-editor'),
      ).toBeNull();
    });
  });
});
