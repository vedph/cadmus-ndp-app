import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FlatLookupPipe, NgxToolsSignalValidators } from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CloseSaveButtonsComponent,
  HelpLinkComponent,
  ModelEditorComponentBase,
  copyFormValue,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { LookupProviderOptions } from '@myrmidon/cadmus-refs-lookup';

import {
  PRINT_FONTS_PART_TYPEID,
  PrintFont,
  PrintFontsPart,
} from '../print-fonts-part';
import { PrintFontEditorComponent } from '../print-font-editor/print-font-editor.component';

interface PrintFontsPartSettings {
  lookupProviderOptions?: LookupProviderOptions;
}

interface PrintFontsPartControls {
  fonts: PrintFont[];
}

function toDraft(part?: PrintFontsPart | null): PrintFontsPartControls {
  // copy: the form tags the objects in its arrays
  return { fonts: copyFormValue(part?.fonts || []) };
}

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
    FlatLookupPipe,
    HelpLinkComponent,
  ],
  templateUrl: './print-fonts-part.component.html',
  styleUrl: './print-fonts-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintFontsPartComponent extends ModelEditorComponentBase<PrintFontsPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<PrintFont | undefined>(undefined);

  // print-font-families
  public readonly familyEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['print-font-families']?.entries,
  );
  // print-layout-sections
  public readonly sectionEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['print-layout-sections']?.entries,
  );
  // print-font-features
  public readonly featureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['print-font-features']?.entries,
  );
  // doc-reference-types
  public readonly docRefTypeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-types']?.entries,
  );
  // doc-reference-tags
  public readonly docRefTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['doc-reference-tags']?.entries,
  );
  // assertion-tags
  public readonly assTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['assertion-tags']?.entries,
  );
  // external-id-tags
  public readonly extIdTagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-tags']?.entries,
  );
  // external-id-scopes
  public readonly extIdScopeEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['external-id-scopes']?.entries,
  );
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
    NgxToolsSignalValidators.strictMinLength(p.fonts, 1);
  });

  constructor() {
    super();
    this.initSettings<PrintFontsPartSettings>(
      PRINT_FONTS_PART_TYPEID,
      (settings) =>
        this.lookupProviderOptions.set(
          settings?.lookupProviderOptions || undefined,
        ),
    );
  }

  protected getValue(): PrintFontsPart {
    const part = this.getEditedPart(PRINT_FONTS_PART_TYPEID) as PrintFontsPart;
    part.fonts = copyFormValue(this._draft().fonts);
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
    this.edited.set(structuredClone(entry));
  }

  public closeFont(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public saveFont(entry: PrintFont): void {
    const fonts = [...this.form.fonts().value()];
    if (this.editedIndex() === -1) {
      fonts.push(entry);
    } else {
      fonts.splice(this.editedIndex(), 1, entry);
    }
    this.form.fonts().value.set(fonts);
    this.form.fonts().markAsDirty();
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
          const entries = [...this.form.fonts().value()];
          entries.splice(index, 1);
          this.form.fonts().value.set(entries);
          this.form.fonts().markAsDirty();
        }
      });
  }

  public moveFontUp(index: number): void {
    if (index < 1) {
      return;
    }
    const fonts = [...this.form.fonts().value()];
    const font = fonts[index];
    fonts.splice(index, 1);
    fonts.splice(index - 1, 0, font);
    this.form.fonts().value.set(fonts);
    this.form.fonts().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
    }
  }

  public moveFontDown(index: number): void {
    if (index + 1 >= this.form.fonts().value().length) {
      return;
    }
    const fonts = [...this.form.fonts().value()];
    const font = fonts[index];
    fonts.splice(index, 1);
    fonts.splice(index + 1, 0, font);
    this.form.fonts().value.set(fonts);
    this.form.fonts().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index + 1);
    } else if (this.editedIndex() === index + 1) {
      this.editedIndex.set(index);
    }
  }
}
