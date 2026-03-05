import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
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

import {
  EllipsisPipe,
  FlatLookupPipe,
  NgxToolsValidators,
} from '@myrmidon/ngx-tools';
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

import {
  TEXT_PASSAGES_PART_TYPEID,
  TextPassage,
  TextPassagesPart,
} from '../text-passages-part';
import { TextPassageEditorComponent } from '../text-passage-editor/text-passage-editor.component';

@Component({
  selector: 'cadmus-text-passages-part',
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
    TextPassageEditorComponent,
    EllipsisPipe,
    FlatLookupPipe,
    CloseSaveButtonsComponent,
  ],
  templateUrl: './text-passages-part.component.html',
  styleUrl: './text-passages-part.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextPassagesPartComponent
  extends ModelEditorComponentBase<TextPassagesPart>
  implements OnInit
{
  public readonly editedIndex = signal<number>(-1);
  public readonly edited = signal<TextPassage | undefined>(undefined);

  // text-passage-tags
  public readonly tagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // text-passage-features
  public readonly featureEntries = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );

  public entries: FormControl<TextPassage[]>;

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
    let key = 'text-passage-tags';
    if (this.hasThesaurus(key)) {
      this.tagEntries.set(thesauri[key].entries);
    } else {
      this.tagEntries.set(undefined);
    }
    key = 'text-passage-features';
    if (this.hasThesaurus(key)) {
      this.featureEntries.set(thesauri[key].entries);
    } else {
      this.featureEntries.set(undefined);
    }
  }

  private updateForm(part?: TextPassagesPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.entries.setValue(part.passages || []);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<TextPassagesPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): TextPassagesPart {
    let part = this.getEditedPart(
      TEXT_PASSAGES_PART_TYPEID,
    ) as TextPassagesPart;
    part.passages = this.entries.value || [];
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
    this.edited.set(structuredClone(passage));
  }

  public closePassage(): void {
    this.editedIndex.set(-1);
    this.edited.set(undefined);
  }

  public savePassage(passage: TextPassage): void {
    const entries = [...this.entries.value];
    if (this.editedIndex() === -1) {
      entries.push(passage);
    } else {
      entries.splice(this.editedIndex(), 1, passage);
    }
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
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
          const entries = [...this.entries.value];
          entries.splice(index, 1);
          this.entries.setValue(entries);
          this.entries.markAsDirty();
          this.entries.updateValueAndValidity();
        }
      });
  }

  public movePassageUp(index: number): void {
    if (index < 1) {
      return;
    }
    const passage = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index - 1, 0, passage);
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index - 1);
    } else if (this.editedIndex() === index - 1) {
      this.editedIndex.set(index);
    }
  }

  public movePassageDown(index: number): void {
    if (index + 1 >= this.entries.value.length) {
      return;
    }
    const passage = this.entries.value[index];
    const entries = [...this.entries.value];
    entries.splice(index, 1);
    entries.splice(index + 1, 0, passage);
    this.entries.setValue(entries);
    this.entries.markAsDirty();
    this.entries.updateValueAndValidity();
    // keep editedIndex in sync
    if (this.editedIndex() === index) {
      this.editedIndex.set(index + 1);
    } else if (this.editedIndex() === index + 1) {
      this.editedIndex.set(index);
    }
  }
}
