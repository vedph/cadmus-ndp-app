import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import {
  Citation,
  CitationSpan,
  CitSchemeService,
  CompactCitationComponent,
} from '@myrmidon/cadmus-refs-citation';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { FigPlanItemEditorComponent } from './fig-plan-item-editor.component';
import { FigPlanItem } from '../print-fig-plan-part';

@Component({
  selector: 'cadmus-refs-compact-citation',
  template: '',
})
class MockCompactCitationComponent {
  public readonly citation = input<Citation | CitationSpan | undefined>();
  public readonly citationChange = output<Citation | CitationSpan | undefined>();
}

describe('FigPlanItemEditorComponent', () => {
  let component: FigPlanItemEditorComponent;
  let fixture: ComponentFixture<FigPlanItemEditorComponent>;
  let citService: CitSchemeService;

  const TYPE_ENTRIES: ThesaurusEntry[] = [{ id: 'type-a', value: 'Type A' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigPlanItemEditorComponent],
      providers: [provideNoopAnimations()],
    })
      .overrideComponent(FigPlanItemEditorComponent, {
        remove: { imports: [CompactCitationComponent] },
        add: { imports: [MockCompactCitationComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(FigPlanItemEditorComponent);
    component = fixture.componentInstance;
    citService = TestBed.inject(CitSchemeService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('buildForm / validity', () => {
    it('should be invalid without eid and type', () => {
      fixture.detectChanges();
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with eid and type set', () => {
      fixture.detectChanges();
      component.eid.setValue('e1');
      component.type.setValue('type-a');
      expect(component.form.valid).toBe(true);
    });

    it('should be invalid when eid exceeds 100 characters', () => {
      fixture.detectChanges();
      component.eid.setValue('x'.repeat(101));
      expect(component.eid.invalid).toBe(true);
    });

    it('should be invalid when citation exceeds 1000 characters', () => {
      fixture.detectChanges();
      component.citation?.setValue('x'.repeat(1001));
      expect(component.citation?.invalid).toBe(true);
    });
  });

  describe('updateForm (via item model effect)', () => {
    it('should reset the form and clear editedCit when item is undefined', () => {
      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
      } as FigPlanItem);
      fixture.detectChanges();

      fixture.componentRef.setInput('item', undefined);
      fixture.detectChanges();

      expect(component.eid.value).toBe('');
      expect(component.editedCit()).toBeUndefined();
    });

    it('should populate eid, type and citation from the data', () => {
      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
        citation: 'If. I 1',
      } as FigPlanItem);
      fixture.detectChanges();

      expect(component.eid.value).toBe('e1');
      expect(component.type.value).toBe('type-a');
      expect(component.citation?.value).toBe('If. I 1');
      expect(component.form.pristine).toBe(true);
    });

    it('should parse a single citation when it has no " - "', () => {
      const parsed: Citation = { schemeId: 'dc', steps: [] };
      const parseSpy = vi.spyOn(citService, 'parse').mockReturnValue(parsed);
      const parseSpanSpy = vi.spyOn(citService, 'parseSpan');

      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
        citation: 'If. I 1',
      } as FigPlanItem);
      fixture.detectChanges();

      expect(parseSpy).toHaveBeenCalledWith('If. I 1', 'dc');
      expect(parseSpanSpy).not.toHaveBeenCalled();
      expect(component.editedCit()).toEqual(parsed);
    });

    it('should parse a citation span when it contains " - "', () => {
      const span: CitationSpan = { a: { schemeId: 'dc', steps: [] } };
      const parseSpanSpy = vi
        .spyOn(citService, 'parseSpan')
        .mockReturnValue(span);

      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
        citation: 'If. I 1 - If. I 10',
      } as FigPlanItem);
      fixture.detectChanges();

      expect(parseSpanSpy).toHaveBeenCalledWith('If. I 1 - If. I 10', 'dc');
      expect(component.editedCit()).toEqual(span);
    });

    it('should clear editedCit when citation is absent', () => {
      fixture.componentRef.setInput('item', {
        eid: 'e1',
        type: 'type-a',
      } as FigPlanItem);
      fixture.detectChanges();

      expect(component.editedCit()).toBeUndefined();
    });
  });

  describe('onCitationChange', () => {
    it('should clear the citation control when passed undefined', () => {
      fixture.detectChanges();
      component.citation?.setValue('If. I 1');

      component.onCitationChange(undefined);

      expect(component.citation?.value).toBeNull();
    });

    it('should render a single citation via toString', () => {
      fixture.detectChanges();
      vi.spyOn(citService, 'toString').mockReturnValue('If. I 1');

      component.onCitationChange({ schemeId: 'dc', steps: [] });

      expect(component.citation?.value).toBe('If. I 1');
      expect(component.citation?.dirty).toBe(true);
    });

    it('should render a citation span as "a - b"', () => {
      fixture.detectChanges();
      const toStringSpy = vi
        .spyOn(citService, 'toString')
        .mockImplementation((c: any) => (c.schemeId === 'dc' ? 'A' : 'B'));

      const span: CitationSpan = {
        a: { schemeId: 'dc', steps: [] },
        b: { schemeId: 'dc2', steps: [] },
      };
      component.onCitationChange(span);

      expect(toStringSpy).toHaveBeenCalled();
      expect(component.citation?.value).toBe('A - B');
    });

    it('should render a citation span with only "a" as "a - a"', () => {
      fixture.detectChanges();
      vi.spyOn(citService, 'toString').mockReturnValue('A');

      const span: CitationSpan = { a: { schemeId: 'dc', steps: [] } };
      component.onCitationChange(span);

      expect(component.citation?.value).toBe('A - A');
    });
  });

  describe('save', () => {
    it('should touch all controls and not update the model when invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.item()).toBeUndefined();
      expect(component.eid.touched).toBe(true);
    });

    it('should build and set data when valid', () => {
      fixture.detectChanges();
      component.eid.setValue('e1');
      component.type.setValue('type-a');
      component.citation?.setValue('If. I 1');

      component.save();

      expect(component.item()).toEqual({
        eid: 'e1',
        type: 'type-a',
        citation: 'If. I 1',
      });
    });

    it('should mark the form pristine by default after saving', () => {
      fixture.detectChanges();
      component.eid.setValue('e1');
      component.type.setValue('type-a');

      component.save();

      expect(component.form.pristine).toBe(true);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      component.eid.setValue('e1');
      component.type.setValue('type-a');
      component.eid.markAsDirty();

      component.save(false);

      expect(component.form.pristine).toBe(false);
      expect(component.item()).toBeTruthy();
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
