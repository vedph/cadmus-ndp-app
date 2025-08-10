import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgxToolsValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
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

/**
 * PrintFontsPart editor component.
 * Thesauri: print-font-families, print-layout-sections,
 * print-font-features, doc-reference-types, doc-reference-tags,
 * assertion-tags, external-id-tags, external-id-scopes.
 */
@Component({
  selector: 'cadmus-print-fonts-part',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './print-fonts-part.component.html',
  styleUrl: './print-fonts-part.component.css',
})
export class PrintFontsPartComponent
  extends ModelEditorComponentBase<PrintFontsPart>
  implements OnInit
{
  public editedIndex: number;
  public edited: PrintFont | undefined;

  // print-font-families
  public familyEntries?: ThesaurusEntry[];
  // print-layout-sections
  public sectionEntries?: ThesaurusEntry[];
  // print-font-features
  public featureEntries?: ThesaurusEntry[];
  // doc-reference-types
  public docRefTypeEntries?: ThesaurusEntry[];
  // doc-reference-tags
  public docRefTagEntries?: ThesaurusEntry[];
  // assertion-tags
  public assTagEntries?: ThesaurusEntry[];
  // external-id-tags
  public extIdTagEntries?: ThesaurusEntry[];
  // external-id-scopes
  public extIdScopeEntries?: ThesaurusEntry[];

  public entries: FormControl<PrintFont[]>;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    private _dialogService: DialogService
  ) {
    super(authService, formBuilder);
    this.editedIndex = -1;
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
    let key = 'print-font-families';
    if (this.hasThesaurus(key)) {
      this.familyEntries = thesauri[key].entries;
    } else {
      this.familyEntries = undefined;
    }
    key = 'print-layout-sections';
    if (this.hasThesaurus(key)) {
      this.sectionEntries = thesauri[key].entries;
    } else {
      this.sectionEntries = undefined;
    }
    key = 'print-font-features';
    if (this.hasThesaurus(key)) {
      this.featureEntries = thesauri[key].entries;
    } else {
      this.featureEntries = undefined;
    }
    key = 'doc-reference-types';
    if (this.hasThesaurus(key)) {
      this.docRefTypeEntries = thesauri[key].entries;
    } else {
      this.docRefTypeEntries = undefined;
    }
    key = 'doc-reference-tags';
    if (this.hasThesaurus(key)) {
      this.docRefTagEntries = thesauri[key].entries;
    } else {
      this.docRefTagEntries = undefined;
    }
    key = 'assertion-tags';
    if (this.hasThesaurus(key)) {
      this.assTagEntries = thesauri[key].entries;
    } else {
      this.assTagEntries = undefined;
    }
    key = 'external-id-tags';
    if (this.hasThesaurus(key)) {
      this.extIdTagEntries = thesauri[key].entries;
    } else {
      this.extIdTagEntries = undefined;
    }
    key = 'external-id-scopes';
    if (this.hasThesaurus(key)) {
      this.extIdScopeEntries = thesauri[key].entries;
    } else {
      this.extIdScopeEntries = undefined;
    }
  }

  private updateForm(part?: PrintFontsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.entries.setValue(part.fonts || []);
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
    part.fonts = this.entries.value || [];
    return part;
  }

  public addPrintFont(): void {
    const entry: PrintFont = {
      // TODO: set your entry default properties...
    };
    this.editPrintFont(entry, -1);
  }

  public editPrintFont(entry: PrintFont, index: number): void {
    this.editedIndex = index;
    this.edited = entry;
  }

  public closePrintFont(): void {
    this.editedIndex = -1;
    this.edited = undefined;
  }

  public savePrintFont(entry: PrintFont): void {
    const entries = [...this.entries.value];
    if (this.editedIndex === -1) {
      entries.push(entry);
    } else {
      entries.splice(this.editedIndex, 1, entry);
    }
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
    this.closePrintFont();
  }

  public deletePrintFont(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete PrintFont?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex === index) {
            this.closePrintFont();
          }
          const entries = [...this.entries.value];
          entries.splice(index, 1);
          this.entries.setValue(entries);
          this.entries.markAsDirty();
          this.entries.updateValueAndValidity();
        }
      });
  }

  public movePrintFontUp(index: number): void {
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

  public movePrintFontDown(index: number): void {
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
