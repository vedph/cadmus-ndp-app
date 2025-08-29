import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
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

import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  AssertedCompositeId,
  AssertedCompositeIdComponent,
} from '@myrmidon/cadmus-refs-asserted-ids';
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
import { Flag, FlagSetComponent } from '@myrmidon/cadmus-ui-flag-set';
import {
  PhysicalSize,
  PhysicalSizeComponent,
} from '@myrmidon/cadmus-mat-physical-size';

import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import { FigPlanImplItem, FigPlanItemLabel } from '../print-fig-plan-impl-part';
import { FigPlanItemLabelEditorComponent } from '../fig-plan-item-label-editor/fig-plan-item-label-editor.component';

function entryToFlag(entry: ThesaurusEntry): Flag {
  return {
    id: entry.id,
    label: entry.value,
  };
}

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
    AssertedCompositeIdComponent,
    FlagSetComponent,
    PhysicalSizeComponent,
    FigPlanItemLabelEditorComponent,
  ],
  templateUrl: './fig-plan-impl-item-editor.component.html',
  styleUrl: './fig-plan-impl-item-editor.component.css',
})
export class FigPlanImplItemEditorComponent {
  public readonly item = model<FigPlanImplItem | undefined>();
  public readonly cancelEdit = output();

  // fig-plan-types
  public readonly typeEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-positions
  public readonly positionEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-change-types
  public readonly changeTypeEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-item-features
  public readonly featureEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-matrix-types
  public readonly matrixTypeEntries = input<ThesaurusEntry[]>();
  // fig-plan-impl-matrix-states
  public readonly matrixStateEntries = input<ThesaurusEntry[]>();

  // asserted-id-scopes
  public readonly assIdScopeEntries = input<ThesaurusEntry[]>();
  // asserted-id-tags
  public readonly assIdTagEntries = input<ThesaurusEntry[]>();
  // assertion-tags
  public readonly assTagEntries = input<ThesaurusEntry[]>();
  // doc-reference-types
  public readonly refTypeEntries = input<ThesaurusEntry[]>();
  // doc-reference-tags
  public readonly refTagEntries = input<ThesaurusEntry[]>();

  // physical-size-units
  public readonly szUnitEntries = input<ThesaurusEntry[]>();
  // physical-size-tags
  public readonly szTagEntries = input<ThesaurusEntry[]>();
  // physical-size-dim-tags
  public readonly szDimTagEntries = input<ThesaurusEntry[]>();

  // fig-plan-item-label-types
  public readonly labelTypeEntries = input<ThesaurusEntry[]>();
  // fig-plan-item-label-languages
  public readonly labelLangEntries = input<ThesaurusEntry[]>();

  // print-font-families
  public readonly fontFamilyEntries = input<ThesaurusEntry[]>();
  // print-layout-sections
  public readonly layoutSectionEntries = input<ThesaurusEntry[]>();
  // print-font-features
  public readonly fontFeatureEntries = input<ThesaurusEntry[]>();

  // flags mapped from thesaurus entries
  public featureFlags = computed<Flag[]>(
    () => this.featureEntries()?.map((e) => entryToFlag(e)) || []
  );

  // the edited citation
  public readonly editedCit = signal<Citation | CitationSpan | undefined>(
    undefined
  );
  // the edited label
  public readonly editedLabel = signal<FigPlanItemLabel | undefined>(undefined);
  // the edited label index
  public readonly editedLabelIndex = signal<number>(-1);

  public eid: FormControl<string>;
  public type: FormControl<string>;
  public citation: FormControl<string | null>;
  public location: FormControl<CodLocationRange[] | null>;
  public position: FormControl<string | null>;
  public changeType: FormControl<string | null>;
  public iconographyId: FormControl<AssertedCompositeId | null>;
  public features: FormControl<string[]>;
  public size: FormControl<PhysicalSize | null>;
  public matrixType: FormControl<string | null>;
  public matrixState: FormControl<string | null>;
  public matrixStateDsc: FormControl<string | null>;
  public labels: FormControl<FigPlanItemLabel[]>;
  public form: FormGroup;

  constructor(
    formBuilder: FormBuilder,
    private _citService: CitSchemeService,
    private _dialogService: DialogService
  ) {
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
    this.features = formBuilder.control([], { nonNullable: true });
    this.size = formBuilder.control<PhysicalSize | null>(null);
    this.matrixType = formBuilder.control<string | null>(null);
    this.matrixState = formBuilder.control<string | null>(null);
    this.matrixStateDsc = formBuilder.control<string | null>(null);
    this.labels = formBuilder.control<FigPlanItemLabel[]>([], {
      nonNullable: true,
    });

    this.form = formBuilder.group({
      eid: this.eid,
      type: this.type,
      citation: this.citation,
      location: this.location,
      position: this.position,
      changeType: this.changeType,
      iconographyId: this.iconographyId,
      features: this.features,
      size: this.size,
      matrixType: this.matrixType,
      matrixState: this.matrixState,
      matrixStateDsc: this.matrixStateDsc,
      labels: this.labels,
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
      this.iconographyId.setValue(item.iconographyId || null, {
        emitEvent: false,
      });
      this.size.setValue(item.size || null, { emitEvent: false });
      this.matrixType.setValue(item.matrixType || null, { emitEvent: false });
      this.matrixState.setValue(item.matrixState || null, { emitEvent: false });
      this.matrixStateDsc.setValue(item.matrixStateDsc || null, {
        emitEvent: false,
      });
      this.labels.setValue(item.labels || [], { emitEvent: false });
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

  public onFeatureCheckedIdsChange(ids: string[]): void {
    this.features.setValue(ids);
    this.features.markAsDirty();
    this.features.updateValueAndValidity();
  }

  public onSizeChange(size: PhysicalSize): void {
    this.size.setValue(size);
    this.size.markAsDirty();
    this.size.updateValueAndValidity();
  }

  //#region labels
  public addLabel(): void {
    const label: FigPlanItemLabel = {
      type: this.labelTypeEntries()?.[0].id || '',
    };
    this.editLabel(label, -1);
  }

  public editLabel(label: FigPlanItemLabel, index: number): void {
    this.editedLabelIndex.set(index);
    this.editedLabel.set(label);
  }

  public closeLabel(): void {
    this.editedLabelIndex.set(-1);
    this.editedLabel.set(undefined);
  }

  public saveLabel(label: FigPlanItemLabel): void {
    const entries = [...this.labels.value];
    if (this.editedLabelIndex() === -1) {
      entries.push(label);
    } else {
      entries.splice(this.editedLabelIndex(), 1, label);
    }
    this.labels.setValue(entries);
    this.labels.markAsDirty();
    this.labels.updateValueAndValidity();
    this.closeLabel();
  }

  public deleteLabel(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete Label?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedLabelIndex() === index) {
            this.closeLabel();
          }
          const entries = [...this.labels.value];
          entries.splice(index, 1);
          this.labels.setValue(entries);
          this.labels.markAsDirty();
          this.labels.updateValueAndValidity();
        }
      });
  }

  public moveLabelUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.labels.value[index];
    const entries = [...this.labels.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.labels.setValue(entries);
    this.labels.markAsDirty();
    this.labels.updateValueAndValidity();
  }

  public moveLabelDown(index: number): void {
    if (index + 1 >= this.labels.value.length) {
      return;
    }
    const entry = this.labels.value[index];
    const entries = [...this.labels.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.labels.setValue(entries);
    this.labels.markAsDirty();
    this.labels.updateValueAndValidity();
  }
  //#endregion

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
      features: this.features.value.length ? this.features.value : undefined,
      size: this.size.value || undefined,
      matrixType: this.matrixType.value || undefined,
      matrixState: this.matrixState.value || undefined,
      matrixStateDsc: this.matrixStateDsc.value?.trim() || undefined,
      labels: this.labels.value.length ? this.labels.value : undefined,
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
