import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  ResourceLoaderParams,
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

import {
  EllipsisPipe,
  FlatLookupPipe,
  NgxToolsSignalValidators,
} from '@myrmidon/ngx-tools';
import { DialogService } from '@myrmidon/ngx-mat-tools';
import {
  CloseSaveButtonsComponent,
  copyFormValue,
  HelpLinkComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';

import {
  TEXT_PASSAGES_PART_TYPEID,
  TextPassage,
  TextPassagesPart,
} from '../text-passages-part';
import { TextPassageEditorComponent } from '../text-passage-editor/text-passage-editor.component';

/**
 * Settings for this part.
 */
interface TextPassagesPartSettings {
  /** Citation scheme key to use for parsing and formatting the citation. */
  citSchemeKey?: string;
}

// define a type that represents only the data we need for the fetch
type SettingRequest = { typeId: string; roleId: string | undefined } | null;

interface TextPassagesPartControls {
  entries: TextPassage[];
}

function toDraft(part?: TextPassagesPart | null): TextPassagesPartControls {
  // copy: the form tags the objects in its arrays
  return { entries: copyFormValue(part?.passages || []) };
}

@Component({
  selector: 'cadmus-text-passages-part',
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
    TextPassageEditorComponent,
    EllipsisPipe,
    FlatLookupPipe,
    CloseSaveButtonsComponent,
    HelpLinkComponent,
  ],
  templateUrl: './text-passages-part.component.html',
  styleUrl: './text-passages-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPassagesPartComponent extends ModelEditorComponentBase<TextPassagesPart> {
  private readonly _dialogService = inject(DialogService);

  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<TextPassage | undefined>(undefined);

  /**
   * The settings for this part,
   * Given that the setting getter returns a promise, we use resource
   * to handle it reactively.
   */
  public readonly settings = resource({
    params: (): SettingRequest => {
      const id = this.identity();
      if (!id) return null;
      return {
        typeId: id.typeId,
        roleId: id.roleId ?? undefined,
      };
    },

    loader: async ({
      params,
    }: ResourceLoaderParams<SettingRequest>): Promise<
      TextPassagesPartSettings | undefined
    > => {
      if (!params || !this._appRepository) {
        return undefined;
      }
      return await this._appRepository.getSettingFor<TextPassagesPartSettings>(
        params.typeId,
        params.roleId,
      );
    },
  });

  // text-passage-tags
  public readonly tagEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['text-passage-tags']?.entries,
  );
  // text-passage-features
  public readonly featureEntries = computed<ThesaurusEntry[] | undefined>(
    () => this.data()?.thesauri?.['text-passage-features']?.entries,
  );

  private readonly _draft = linkedSignal(() => toDraft(this.data()?.value));
  public readonly form = this.createForm(this._draft, (p) => {
    // at least 1 entry
    NgxToolsSignalValidators.strictMinLength(p.entries, 1);
  });

  protected getValue(): TextPassagesPart {
    const part = this.getEditedPart(
      TEXT_PASSAGES_PART_TYPEID,
    ) as TextPassagesPart;
    part.passages = copyFormValue(this._draft().entries);
    return part;
  }

  public addPassage(): void {
    const passage: TextPassage = {
      citation: '@dc:If. I 1',
    };
    this.editPassage(passage, -1);
  }

  public editPassage(passage: TextPassage, index: number): void {
    this.editedIndex.set(index);
    // structuredClone also drops the form's Symbol tag
    this.edited.set(structuredClone(passage));
  }

  public closePassage(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public savePassage(passage: TextPassage): void {
    const entries = [...this.form.entries().value()];
    if (this.editedIndex() === -1) {
      entries.push(passage);
    } else {
      entries.splice(this.editedIndex(), 1, passage);
    }
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    this.closePassage();
  }

  public deletePassage(index: number): void {
    this._dialogService
      .confirm('Confirmation', 'Delete passage?')
      .subscribe((yes: boolean | undefined) => {
        if (yes) {
          if (this.editedIndex() === index) {
            this.closePassage();
          }
          const entries = [...this.form.entries().value()];
          entries.splice(index, 1);
          this.form.entries().value.set(entries);
          this.form.entries().markAsDirty();
        }
      });
  }

  public movePassageUp(index: number): void {
    if (index < 1) {
      return;
    }
    const entries = [...this.form.entries().value()];
    const passage = entries[index];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, passage);
    this.form.entries().value.set(entries);
    this.form.entries().markAsDirty();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
    }
  }

  public movePassageDown(index: number): void {
    if (index + 1 >= this.form.entries().value().length) {
      return;
    }
    const entries = [...this.form.entries().value()];
    const passage = entries[index];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, passage);
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
