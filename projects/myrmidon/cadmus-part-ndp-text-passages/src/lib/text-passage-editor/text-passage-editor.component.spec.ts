import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import {
  Citation,
  CitationSpan,
  CitSchemeService,
  CompactCitationComponent,
} from '@myrmidon/cadmus-refs-citation';
import { ThesaurusEntriesPickerComponent } from '@myrmidon/cadmus-thesaurus-store';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { TextPassageEditorComponent } from './text-passage-editor.component';
import { TextPassage } from '../text-passages-part';

@Component({
  selector: 'cadmus-refs-compact-citation',
  template: '',
})
class MockCompactCitationComponent {
  public readonly schemeKeys = input<string[]>();
  public readonly citation = input<Citation | CitationSpan | undefined>();
  public readonly citationChange = output<
    Citation | CitationSpan | undefined
  >();
}

@Component({
  selector: 'cadmus-thesaurus-entries-picker',
  template: '',
})
class MockThesaurusEntriesPickerComponent {
  public readonly availableEntries = input<ThesaurusEntry[]>();
  public readonly entries = input<ThesaurusEntry[]>();
  public readonly hierarchicLabels = input<boolean>();
  public readonly entriesChange = output<ThesaurusEntry[]>();
}

describe('TextPassageEditorComponent', () => {
  let component: TextPassageEditorComponent;
  let fixture: ComponentFixture<TextPassageEditorComponent>;
  let citService: CitSchemeService;

  const TAG_ENTRIES: ThesaurusEntry[] = [
    { id: 'tag-a', value: 'Tag A' },
    { id: 'tag-b', value: 'Tag B' },
  ];
  const FEATURE_ENTRIES: ThesaurusEntry[] = [
    { id: 'feat-a', value: 'Feature A' },
    { id: 'feat-b', value: 'Feature B' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextPassageEditorComponent],
      providers: [provideNoopAnimations()],
    })
      .overrideComponent(TextPassageEditorComponent, {
        remove: {
          imports: [CompactCitationComponent, ThesaurusEntriesPickerComponent],
        },
        add: {
          imports: [
            MockCompactCitationComponent,
            MockThesaurusEntriesPickerComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TextPassageEditorComponent);
    component = fixture.componentInstance;
    citService = TestBed.inject(CitSchemeService);
    await fixture.whenStable();
  });

  function getCompactCitationDebugEl() {
    return fixture.debugElement.query(
      By.directive(MockCompactCitationComponent),
    );
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('citation mode rendering', () => {
    it('should render the compact citation editor when citSchemeKey is set', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getCompactCitationDebugEl()).toBeTruthy();
    });

    it('should pass the citSchemeKey as the only scheme key', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const el = getCompactCitationDebugEl();
      const mock = el.componentInstance as MockCompactCitationComponent;
      expect(mock.schemeKeys()).toEqual(['dc']);
    });

    it('should render a free text location field when citSchemeKey is falsy', async () => {
      fixture.componentRef.setInput('citSchemeKey', null);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getCompactCitationDebugEl()).toBeFalsy();
      const input = fixture.nativeElement.querySelector('input[matInput]');
      expect(input).toBeTruthy();
    });
  });

  describe('tag rendering', () => {
    it('should render a bound select when tagEntries is provided', async () => {
      fixture.componentRef.setInput('tagEntries', TAG_ENTRIES);
      fixture.detectChanges();
      await fixture.whenStable();

      const select = fixture.nativeElement.querySelector('mat-select');
      expect(select).toBeTruthy();
    });

    it('should render a free text input when tagEntries is not provided', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const select = fixture.nativeElement.querySelector('mat-select');
      expect(select).toBeFalsy();
    });
  });

  describe('binding the data model', () => {
    it('should reset the form when data is undefined', async () => {
      vi.spyOn(citService, 'parse').mockReturnValue({
        schemeId: 'dc',
        steps: [],
      });
      fixture.componentRef.setInput('data', {
        citation: 'If. I 1',
        tag: 'leftover',
      } as TextPassage);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.form.tag().value()).toBe('leftover');

      fixture.componentRef.setInput('data', undefined);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.tag().value()).toBe('');
      expect(component.form.citation().value()).toBeNull();
    });

    it('should parse a single citation when citation text has no " - "', async () => {
      const parsed: Citation = { schemeId: 'dc', steps: [] };
      const parseSpy = vi.spyOn(citService, 'parse').mockReturnValue(parsed);
      const parseSpanSpy = vi.spyOn(citService, 'parseSpan');

      const data: TextPassage = { citation: 'If. I 1' };
      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(parseSpy).toHaveBeenCalledWith('If. I 1', 'dc');
      expect(parseSpanSpy).not.toHaveBeenCalled();
      expect(component.form.citation().value()).toEqual(parsed);
    });

    it('should parse a citation span when citation text contains " - "', async () => {
      const span: CitationSpan = {
        a: { schemeId: 'dc', steps: [] },
      };
      const parseSpanSpy = vi
        .spyOn(citService, 'parseSpan')
        .mockReturnValue(span);
      const parseSpy = vi.spyOn(citService, 'parse');

      const data: TextPassage = { citation: 'If. I 1 - If. I 10' };
      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(parseSpanSpy).toHaveBeenCalledWith('If. I 1 - If. I 10', 'dc');
      expect(parseSpy).not.toHaveBeenCalled();
      expect(component.form.citation().value()).toEqual(span);
    });

    it('should set the free citation field when citSchemeKey is falsy', async () => {
      fixture.componentRef.setInput('citSchemeKey', null);
      const data: TextPassage = { citation: 'p. 12' };
      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.freeCitation().value()).toBe('p. 12');
    });

    it('should set tag, text and note fields from data', async () => {
      const data: TextPassage = {
        citation: 'If. I 1',
        tag: 'my-tag',
        text: 'some text',
        note: 'some note',
      };
      vi.spyOn(citService, 'parse').mockReturnValue({
        schemeId: 'dc',
        steps: [],
      });

      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.tag().value()).toBe('my-tag');
      expect(component.form.text().value()).toBe('some text');
      expect(component.form.note().value()).toBe('some note');
    });

    it('should show only the data.features ids matching featureEntries', async () => {
      fixture.componentRef.setInput('featureEntries', FEATURE_ENTRIES);
      const data: TextPassage = {
        citation: 'If. I 1',
        features: ['feat-a', 'unknown-id'],
      };
      vi.spyOn(citService, 'parse').mockReturnValue({
        schemeId: 'dc',
        steps: [],
      });

      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.featurePickerEntries()).toEqual([FEATURE_ENTRIES[0]]);
    });

    it('should set an empty features array when data.features is undefined', async () => {
      const data: TextPassage = { citation: 'If. I 1' };
      vi.spyOn(citService, 'parse').mockReturnValue({
        schemeId: 'dc',
        steps: [],
      });

      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.features().value()).toEqual([]);
      expect(component.featurePickerEntries()).toEqual([]);
    });

    it('should mark the form as pristine after loading data', async () => {
      const data: TextPassage = { citation: 'If. I 1' };
      vi.spyOn(citService, 'parse').mockReturnValue({
        schemeId: 'dc',
        steps: [],
      });

      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form().dirty()).toBe(false);
    });
  });

  describe('onCitationChange', () => {
    it('should update the citation field and mark it dirty', () => {
      fixture.detectChanges();
      const citation: Citation = { schemeId: 'dc', steps: [] };

      component.onCitationChange(citation);

      expect(component.form.citation().value()).toEqual(citation);
      expect(component.form.citation().dirty()).toBe(true);
    });
  });

  describe('onFeaturesChange', () => {
    it('should update the features field and mark it dirty', () => {
      fixture.detectChanges();

      component.onFeaturesChange([FEATURE_ENTRIES[1]]);

      expect(component.form.features().value()).toEqual(['feat-b']);
      expect(component.form.features().dirty()).toBe(true);
    });
  });

  describe('save', () => {
    it('should not update data and should touch all fields when the form is invalid', () => {
      fixture.detectChanges();

      component.save();

      expect(component.data()).toBeUndefined();
      expect(component.form.citation().touched()).toBe(true);
      expect(component.form.freeCitation().touched()).toBe(true);
      expect(component.form().getError('atLeastOneRequired')).toBeTruthy();
    });

    it('should build data from the form and update the model when valid (scheme mode)', () => {
      fixture.detectChanges();
      const citation: Citation = { schemeId: 'dc', steps: [] };
      vi.spyOn(citService, 'toString').mockReturnValue('If. I 1');

      component.onCitationChange(citation);
      component.form.tag().value.set('my-tag');
      component.form.text().value.set('some text');
      component.form.note().value.set('some note');

      component.save();

      expect(component.data()).toEqual({
        citation: 'If. I 1',
        tag: 'my-tag',
        features: undefined,
        text: 'some text',
        note: 'some note',
      });
    });

    it('should build data using the free citation field when citSchemeKey is falsy', () => {
      fixture.componentRef.setInput('citSchemeKey', null);
      fixture.detectChanges();

      component.form.freeCitation().value.set(' p. 12 ');
      component.form.freeCitation().markAsDirty();

      component.save();

      expect(component.data()).toEqual({
        citation: 'p. 12',
        tag: undefined,
        features: undefined,
        text: undefined,
        note: undefined,
      });
    });

    it('should include mapped feature ids in the saved data', () => {
      fixture.detectChanges();
      const citation: Citation = { schemeId: 'dc', steps: [] };
      vi.spyOn(citService, 'toString').mockReturnValue('If. I 1');

      component.onCitationChange(citation);
      component.onFeaturesChange([FEATURE_ENTRIES[0], FEATURE_ENTRIES[1]]);

      component.save();

      expect(component.data()?.features).toEqual(['feat-a', 'feat-b']);
    });

    it('should mark the form as pristine by default after saving', () => {
      fixture.detectChanges();
      vi.spyOn(citService, 'toString').mockReturnValue('If. I 1');
      component.onCitationChange({ schemeId: 'dc', steps: [] });

      component.save();

      expect(component.form().dirty()).toBe(false);
    });

    it('should keep the form dirty when saving with pristine=false', () => {
      fixture.detectChanges();
      vi.spyOn(citService, 'toString').mockReturnValue('If. I 1');
      component.onCitationChange({ schemeId: 'dc', steps: [] });

      component.save(false);

      expect(component.form().dirty()).toBe(true);
      expect(component.data()).toBeTruthy();
    });
  });

  describe('child echoes', () => {
    it('should stay pristine when the citation editor echoes the bound citation', async () => {
      const parsed: Citation = { schemeId: 'dc', steps: [] };
      vi.spyOn(citService, 'parse').mockReturnValue(parsed);
      fixture.componentRef.setInput('data', { citation: 'If. I 1' });
      fixture.detectChanges();
      await fixture.whenStable();

      component.onCitationChange({ schemeId: 'dc', steps: [] });
      component.onFeaturesChange([]);

      expect(component.form().dirty()).toBe(false);
    });

    it('should keep the edits when featureEntries change', async () => {
      vi.spyOn(citService, 'parse').mockReturnValue({
        schemeId: 'dc',
        steps: [],
      });
      fixture.componentRef.setInput('data', { citation: 'If. I 1' });
      fixture.detectChanges();
      await fixture.whenStable();
      component.form.text().value.set('edited');

      fixture.componentRef.setInput('featureEntries', FEATURE_ENTRIES);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.text().value()).toBe('edited');
    });
  });

  describe('template', () => {
    it('should render no <form> element', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('should save on Enter in a text input when valid and dirty', async () => {
      fixture.componentRef.setInput('citSchemeKey', null);
      fixture.componentRef.setInput('data', { citation: 'p. 12' });
      fixture.detectChanges();
      await fixture.whenStable();
      component.form.freeCitation().value.set('p. 13');
      component.form.freeCitation().markAsDirty();
      fixture.detectChanges();

      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('input[matInput]');
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );

      expect(component.data()?.citation).toBe('p. 13');
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
