import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { FlatLookupPipe, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import {
  EditedObject,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';

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
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  NOTABLE_WORD_FORMS_PART_TYPEID,
  NotableWordForm,
  NotableWordFormsPart,
} from '../notable-word-forms-part';
import { TitleCasePipe } from '@angular/common';
import { NotableWordFormEditorComponent } from '../notable-word-form-editor/notable-word-form-editor.component';

interface NotableWordFormsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
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
    ReactiveFormsModule,
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
  ],
  templateUrl: './notable-word-forms-part.component.html',
  styleUrl: './notable-word-forms-part.component.css',
})
export class NotableWordFormsPartComponent
  extends ModelEditorComponentBase<NotableWordFormsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<NotableWordForm | undefined>(undefined);

  // notable-word-forms-languages
  public readonly langEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // notable-word-forms-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // notable-word-forms-op-tags
  public readonly opTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-types
  public readonly docRefTypeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // doc-reference-tags
  public readonly docRefTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // pin-link-scopes
  public readonly pinLinkScopeEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // pin-link-tags
  public readonly pinLinkTagEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  // pin-link-assertion-tags
  public readonly pinLinkAssertionTagEntries = signal<
    ThesaurusEntry[] | undefined
  >(undefined);
  // pin-link-docref-types
  public readonly pinLinkDocRefTypeEntries = signal<
    ThesaurusEntry[] | undefined
  >(undefined);
  // pin-link-docref-tags
  public readonly pinLinkDocRefTagEntries = signal<
    ThesaurusEntry[] | undefined
  >(undefined);
  // asserted-id-features
  public readonly idFeatureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );

  // lookup options depending on role
  public readonly lookupProviderOptions = signal<
    LookupProviderOptions | undefined
  >(undefined);

  public entries: FormControl<NotableWordForm[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService,
  ) {
    super(authService, formBuilder);
    // form
    this.entries = formBuilder.control([], {
      // at least 1 entry
      validators: NgxToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      entries: this.entries,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'notable-word-forms-languages';
    if (this.hasThesaurus(key)) {
      this.langEntries.set(thesauri[key].entries);
    } else {
      this.langEntries.set(undefined);
    }
    key = 'notable-word-forms-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
    }
    key = 'notable-word-forms-op-tags';
    if (this.hasThesaurus(key)) {
      this.opTagEntries.set(thesauri[key].entries);
    } else {
      this.opTagEntries.set(undefined);
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.docRefTypeEntries.set(thesauri[key].entries);
    } else {
      this.docRefTypeEntries.set(undefined);
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.docRefTagEntries.set(thesauri[key].entries);
    } else {
      this.docRefTagEntries.set(undefined);
    }
    key = 'pin-link-scopes';
    if (this.hasThesaurus(key)) {
      this.pinLinkScopeEntries.set(thesauri[key].entries);
    } else {
      this.pinLinkScopeEntries.set(undefined);
    }
    key = 'pin-link-tags';
    if (this.hasThesaurus(key)) {
      this.pinLinkTagEntries.set(thesauri[key].entries);
    } else {
      this.pinLinkTagEntries.set(undefined);
    }
    key = 'pin-link-assertion-tags';
    if (this.hasThesaurus(key)) {
      this.pinLinkAssertionTagEntries.set(thesauri[key].entries);
    } else {
      this.pinLinkAssertionTagEntries.set(undefined);
    }
    key = 'pin-link-docref-types';
    if (this.hasThesaurus(key)) {
      this.pinLinkDocRefTypeEntries.set(thesauri[key].entries);
    } else {
      this.pinLinkDocRefTypeEntries.set(undefined);
    }
    key = 'pin-link-docref-tags';
    if (this.hasThesaurus(key)) {
      this.pinLinkDocRefTagEntries.set(thesauri[key].entries);
    } else {
      this.pinLinkDocRefTagEntries.set(undefined);
    }
    key = 'asserted-id-features';
    if (this.hasThesaurus(key)) {
      this.idFeatureEntries.set(thesauri[key].entries);
    } else {
      this.idFeatureEntries.set(undefined);
    }
  }

  private updateForm(part?: NotableWordFormsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.entries.setValue(part.forms || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(
    data?: EditedObject<NotableWordFormsPart>,
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }
    // settings
    this._appRepository
      ?.getSettingFor<NotableWordFormsPartSettings>(
        NOTABLE_WORD_FORMS_PART_TYPEID,
        this.identity()?.roleId || undefined,
      )
      .then((settings) => {
        const options = settings?.lookupProviderOptions;
        this.lookupProviderOptions.set(options || undefined);
      });
    // form
    this.updateForm(data?.value);
  }

  protected getValue(): NotableWordFormsPart {
    let part = this.getEditedPart(
      NOTABLE_WORD_FORMS_PART_TYPEID,
    ) as NotableWordFormsPart;
    part.forms = this.entries.value || [];
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
    this.edited.set(structuredClone(entry));
  }

  public closeForm(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveForm(entry: NotableWordForm): void {
    const entries = [...this.entries.value];
    if (this.editedIndex() === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex(), 1, entry);
    }
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
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
          const entries = [...this.entries.value];
          entries.splice(index, 1);
          this.entries.setValue(entries);
          this.entries.markAsDirty();
          this.entries.updateValueAndValidity();
        }
      });
  }

  public moveFormUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, entry);
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
  }

  public moveFormDown(index: number): void {
    if (index + 1 >= this.entries.value.length) {
      return;
    }
    const entry = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, entry);
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
  }
}
