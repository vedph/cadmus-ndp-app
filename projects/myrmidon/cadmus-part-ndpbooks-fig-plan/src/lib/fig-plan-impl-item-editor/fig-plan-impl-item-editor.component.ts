import { Component, effect, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AssertedCompositeId, AssertedCompositeIdComponent } from '@myrmidon/cadmus-refs-asserted-ids';
import {
  CodLocationComponent,
  CodLocationParser,
  CodLocationRange,
} from '@myrmidon/cadmus-cod-location';
import {
  Citation,
  CitationSpan,
  CitSchemeService,
  CompactCitationComponent,
} from '@myrmidon/cadmus-refs-citation';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { FigPlanImplItem } from '../print-fig-plan-impl-part';

/**
 * Editor for a figurative plan's implementation item.
 */
@Component({
  selector: 'cadmus-fig-plan-impl-item-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    CodLocationComponent,
    CompactCitationComponent,
    AssertedCompositeIdComponent
  ],
  templateUrl: './fig-plan-impl-item-editor.component.html',
  styleUrl: './fig-plan-impl-item-editor.component.css',
})
export class FigPlanImplItemEditorComponent {
  public readonly item = model<FigPlanImplItem | undefined>();
  public readonly cancelEdit = output();

  public readonly typeEntries = input<ThesaurusEntry[]>();
  public readonly editedCit = signal<Citation | CitationSpan | undefined>(
    undefined
  );

  public eid: FormControl<string>;
  public type: FormControl<string>;
  public citation: FormControl<string | null>;
  public location: FormControl<CodLocationRange[] | null>;
  public position: FormControl<string | null>;
  public changeType: FormControl<string | null>;
  public iconographyId: FormControl<AssertedCompositeId | null>;
  public form: FormGroup;

  // fig-plan-impl-positions
  public readonly positionEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-change-types
  public readonly changeTypeEntries = input<ThesaurusEntry[]>();

  constructor(formBuilder: FormBuilder, private _citService: CitSchemeService) {
    this.eid = formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    });
    this.type = formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    });
    this.citation = formBuilder.control<string | null>(null, {
      validators: [Validators.maxLength(1000)],
    });
    this.location = formBuilder.control<CodLocationRange[]>([]);
    this.position = formBuilder.control<string | null>(null);
    this.changeType = formBuilder.control<string | null>(null);
    this.iconographyId = formBuilder.control<AssertedCompositeId | null>(null);

    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      citation: this.citation,
      location: this.location,
      position: this.position,
      changeType: this.changeType,
      iconographyId: this.iconographyId,
    });

    // when model changes, update form
    effect(() => {
      const data = this.item();
      this.updateForm(data);
    });
  }

  private updateForm(item: FigPlanImplItem | undefined | null): void {
    if (!item) {
      this.editedCit.set(undefined);
      this.form.reset();
    } else {
      this.eid.setValue(item.eid, { emitEvent: false });
      this.type.setValue(item.type, { emitEvent: false });
      this.citation?.setValue(item.citation || null, { emitEvent: false });
      // parse citation, whether it's a span or a single one
      if (item.citation) {
        this.editedCit.set(
          item.citation.includes(' - ')
            ? this._citService.parseSpan(item.citation, 'dc')
            : this._citService.parse(item.citation, 'dc')
        );
      } else {
        this.editedCit.set(undefined);
      }
      if (item.location) {
        const location = CodLocationParser.parseLocation(item.location);
        this.location.setValue(
          location ? [{ start: location, end: location }] : [],
          { emitEvent: false }
        );
      }
      this.position.setValue(item.position || null, { emitEvent: false });
      this.changeType.setValue(item.changeType || null, { emitEvent: false });
      this.iconographyId.setValue(item.iconographyId || null, { emitEvent: false });
    }

    this.form.markAsPristine();
  }

  public onCitationChange(citation: Citation | CitationSpan | undefined): void {
    if (!citation) {
      this.citation?.setValue(null);
    } else {
      if ((citation as CitationSpan)?.a) {
        const span = citation as CitationSpan;
        this.citation?.setValue(
          `${this._citService.toString(span.a)} - ${this._citService.toString(
            span.b || span.a
          )}`
        );
      } else {
        this.citation?.setValue(
          this._citService.toString(citation as Citation)
        );
      }
    }
    this.citation?.updateValueAndValidity();
    this.citation?.markAsDirty();
  }

  public onLocationChange(location: CodLocationRange[]): void {
    this.location.setValue(location);
    this.location.markAsDirty();
    this.location.updateValueAndValidity();
  }

  public onIdChange(id: AssertedCompositeId | null): void {
    this.iconographyId.setValue(id);
    this.iconographyId.markAsDirty();
    this.iconographyId.updateValueAndValidity();
  }

  private getItem(): FigPlanImplItem {
    return {
      eid: this.eid.value,
      type: this.type.value,
      citation: this.citation?.value ?? undefined,
      location: this.location.value?.length
        ? CodLocationParser.locationToString(this.location.value[0].start)!
        : undefined,
      position: this.position.value || undefined,
      changeType: this.changeType.value || undefined,
      iconographyId: this.iconographyId.value || undefined,
    };
  }

  public cancel(): void {
    this.cancelEdit.emit();
  }

  /**
   * Saves the current form data by updating the `item` model signal.
   * This method can be called manually (e.g., by a Save button) or
   * automatically (via auto-save).
   * @param pristine If true (default), the form is marked as pristine
   * after saving.
   * Set to false for auto-save if you want the form to remain dirty.
   */
  public save(pristine = true): void {
    if (this.form.invalid) {
      // show validation errors
      this.form.markAllAsTouched();
      return;
    }

    const item = this.getItem();
    this.item.set(item);

    if (pristine) {
      this.form.markAsPristine();
    }
  }
}
