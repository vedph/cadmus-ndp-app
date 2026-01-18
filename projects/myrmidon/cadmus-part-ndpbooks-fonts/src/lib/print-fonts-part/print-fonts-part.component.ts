import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { deepCopy, FlatLookupPipe, NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { CloseSaveButtonsComponent, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import {
  EditedObject,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';

import {
  PRINT_FONTS_PART_TYPEID,
  PrintFont,
  PrintFontsPart,
} from '../print-fonts-part';
import { PrintFontEditorComponent } from '../print-font-editor/print-font-editor.component';

/**
 * PrintFontsPart editor component.
 * Thesauri: print-font-families, print-layout-sections,
 * print-font-features, doc-reference-types, doc-reference-tags,
 * assertion-tags, external-id-tags, external-id-scopes,
 * asserted-id-features.
 */
@Component({
  selector: 'cadmus-print-fonts-part',
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
    MatTooltipModule,
    CloseSaveButtonsComponent,
    PrintFontEditorComponent,
    FlatLookupPipe
  ],
  templateUrl: './print-fonts-part.component.html',
  styleUrl: './print-fonts-part.component.css',
})
export class PrintFontsPartComponent
  extends ModelEditorComponentBase<PrintFontsPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<PrintFont | undefined>(undefined);

  // print-font-families
  public readonly familyEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // print-layout-sections
  public readonly sectionEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // print-font-features
  public readonly featureEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-types
  public readonly docRefTypeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // doc-reference-tags
  public readonly docRefTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // assertion-tags
  public readonly assTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // external-id-tags
  public readonly extIdTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // external-id-scopes
  public readonly extIdScopeEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // asserted-id-features
  public readonly idFeatureEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  public fonts: FormControl<PrintFont[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    // form
    this.fonts = formBuilder.control([], {
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
      entries: this.fonts,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'print-font-families';
    if (this.hasThesaurus(key)) {
      this.familyEntries.set(thesauri[key].entries);
    } else {
      this.familyEntries.set(undefined);
    }
    key = 'print-layout-sections';
    if (this.hasThesaurus(key)) {
      this.sectionEntries.set(thesauri[key].entries);
    } else {
      this.sectionEntries.set(undefined);
    }
    key = 'print-font-features';
    if (this.hasThesaurus(key)) {
      this.featureEntries.set(thesauri[key].entries);
    } else {
      this.featureEntries.set(undefined);
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
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries.set(thesauri[key].entries);
    } else {
      this.assTagEntries.set(undefined);
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.extIdTagEntries.set(thesauri[key].entries);
    } else {
      this.extIdTagEntries.set(undefined);
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.extIdScopeEntries.set(thesauri[key].entries);
    } else {
      this.extIdScopeEntries.set(undefined);
    }
    key = 'asserted-id-features';
    if (this.hasThesaurus(key)) {
      this.idFeatureEntries.set(thesauri[key].entries);
    } else {
      this.idFeatureEntries.set(undefined);
    }
  }

  private updateForm(part?: PrintFontsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.fonts.setValue(part.fonts || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<PrintFontsPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): PrintFontsPart {
    let part = this.getEditedPart(PRINT_FONTS_PART_TYPEID) as PrintFontsPart;
    part.fonts = this.fonts.value || [];
    return part;
  }

  public addFont(): void {
    const font: PrintFont = {
      family: '',
    };
    this.editFont(font, -1);
  }

  public editFont(entry: PrintFont, index: number): void {
    this.editedIndex.set(index);
    this.edited.set(deepCopy(entry));
  }

  public closeFont(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveFont(entry: PrintFont): void {
    const fonts = [...this.fonts.value];
    if (this.editedIndex() === -1) {
      fonts.push(entry);
    } else {
      fonts.splice(this.editedIndex(), 1, entry);
    }
    this.fonts.setValue(fonts);
    this.fonts.markAsDirty();
    this.fonts.updateValueAndValidity();
    this.closeFont();
  }

  public deleteFont(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete font?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closeFont();
          }
          const entries = [...this.fonts.value];
          entries.splice(index, 1);
          this.fonts.setValue(entries);
          this.fonts.markAsDirty();
          this.fonts.updateValueAndValidity();
        }
      });
  }

  public moveFontUp(index: number): void {
    if (index < 1) {
      return;
    }
    const font = this.fonts.value[index];
    const fonts = [...this.fonts.value];
    fonts.splice(index, 1);
    fonts.splice(index - 1, 0, font);
    this.fonts.setValue(fonts);
    this.fonts.markAsDirty();
    this.fonts.updateValueAndValidity();
  }

  public moveFontDown(index: number): void {
    if (index + 1 >= this.fonts.value.length) {
      return;
    }
    const font = this.fonts.value[index];
    const fonts = [...this.fonts.value];
    fonts.splice(index, 1);
    fonts.splice(index + 1, 0, font);
    this.fonts.setValue(fonts);
    this.fonts.markAsDirty();
    this.fonts.updateValueAndValidity();
  }
}
