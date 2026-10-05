import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';

import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';

import { FlatLookupPipe, NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CloseSaveButtonsComponent,
  copyFormValue,
  HelpLinkComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  NOTABLE_WORD_FORMS_PART_TYPEID,
  NotableWordForm,
  NotableWordFormsPart,
} from '../notable-word-forms-part';
import { NotableWordFormEditorComponent } from '../notable-word-form-editor/notable-word-form-editor.component';

interface NotableWordFormsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

interface NotableWordFormsPartControls {
  entries: NotableWordForm[];
}

function toDraft(
  part?: NotableWordFormsPart | null,
): NotableWordFormsPartControls {
  // copy: the form tags the objects in its arrays
  return { entries: copyFormValue(part?.forms || []) };
}

/**
 * NotableWordFormsPart editor component.
 * Thesauri: notable-word-forms-languages, notable-word-forms-tags,
 * notable-word-forms-op-tags, doc-reference-types, doc-reference-tags,
 * pin-link-scopes, pin-link-tags, pin-link-assertion-tags,
 * pin-link-docref-types, pin-link-docref-tags, asserted-id-features.
 */
@Component({
  selector: 'cadmus-notable-word-forms-part',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    MatIconButton,
    MatTooltip,
    TitleCasePipe,
    FlatLookupPipe,
    CloseSaveButtonsComponent,
    NotableWordFormEditorComponent,
    HelpLinkComponent,
  ],
  templateUrl: './notable-word-forms-part.component.html',
  styleUrl: './notable-word-forms-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotableWordFormsPartComponent extends ModelEditorComponentBase<NotableWordFormsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<NotableWordForm | undefined>(undefined);

  // notable-word-forms-languages
  public readonly langEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['notable-word-forms-languages']?.entries,
  );
  // notable-word-forms-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['notable-word-forms-tags']?.entries,
  );
  // notable-word-forms-op-tags
  public readonly opTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['notable-word-forms-op-tags']?.entries,
  );
  // doc-reference-types
  public readonly docRefTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly docRefTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // pin-link-scopes
  public readonly pinLinkScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['pin-link-scopes']?.entries,
  );
  // pin-link-tags
  public readonly pinLinkTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['pin-link-tags']?.entries,
  );
  // pin-link-assertion-tags
  public readonly pinLinkAssertionTagEntries = computed<
    ThesaurusEntry[] | undefined
  >(() => this.data()?.thesauri?.['pin-link-assertion-tags']?.entries);
  // pin-link-docref-types
  public readonly pinLinkDocRefTypeEntries = computed<
    ThesaurusEntry[] | undefined
  >(() => this.data()?.thesauri?.['pin-link-docref-types']?.entries);
  // pin-link-docref-tags
  public readonly pinLinkDocRefTagEntries = computed<
    ThesaurusEntry[] | undefined
  >(() => this.data()?.thesauri?.['pin-link-docref-tags']?.entries);
  // asserted-id-features
  public readonly idFeatureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['asserted-id-features']?.entries,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.entries, 1);
  });

  constructor() {
    super();
    this.initSettings<NotableWordFormsPartSettings>(
      NOTABLE_WORD_FORMS_PART_TYPEID,
      (settings) =>
        this.lookupProviderOptions.set(
          settings?.lookupProviderOptions || undefined,
        ),
    );
  }

  protected getValue(): NotableWordFormsPart {
    const part = this.getEditedPart(
      NOTABLE_WORD_FORMS_PART_TYPEID,
    ) as NotableWordFormsPart;
    part.forms = copyFormValue(this._draft().entries);
    return part;
  }

  public addForm(): void {
    const entry: NotableWordForm = {
      value: '',
    };
    this.editForm(entry, -1);
  }

  public editForm(entry: NotableWordForm, index: number): void {
    this.editedIndex.set(index);
    // structuredClone also drops the form's Symbol tag
    this.edited.set(structuredClone(entry));
  }

  public closeForm(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveForm(entry: NotableWordForm): void {
    const entries = [...this.form.entries().value()];
    if (this.editedIndex() === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex(), 1, entry);
    }
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    this.closeForm();
  }

  public deleteForm(index: number): void {
    this._dialogService
      .confirm('Confirmation', `Delete form #${index + 1}?`)
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeForm();
          }
          const entries = [...this.form.entries().value()];
          entries.splice(index, 1);
          this.form.entries().value.set(entries);
          this.form.entries().markAsDirty();
        }
      });
  }

  public moveFormUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entries = [...this.form.entries().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
    }
  }

  public moveFormDown(index: number): void {
    if (index + 1 >= this.form.entries().value().length) {
      return;
    }
    const entries = [...this.form.entries().value()];
    const entry = entries[index];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index + 1);
    } else if (this.editedIndex() === index + 1) {
      this.editedIndex.set(index);
    }
  }
}
