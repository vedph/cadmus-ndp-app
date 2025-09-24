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

import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import {
  EditedObject,
  ThesauriSet,
  ThesaurusEntry,
} from '@myrmidon/cadmus-core';
import {
  CloseSaveButtonsComponent,
  ModelEditorComponentBase,
} from '@myrmidon/cadmus-ui';
import {
  DRAWING_TECH_PART_TYPEID,
  DrawingTechPart,
} from '../drawing-tech-part';

/**
 * Drawing techniques part editor component.
 * Thesauri: drawing-tech-materials, drawing-tech-features, drawing-tech-techniques,
 * drawing-tech-colors, drawing-tech-size-units, drawing-tech-dim-tags,
 * drawing-tech-measure-names.
 */
@Component({
  selector: 'cadmus-drawing-tech-part',
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
    // cadmus
    CloseSaveButtonsComponent,
  ],
  templateUrl: './drawing-tech-part.component.html',
  styleUrl: './drawing-tech-part.component.css',
})
export class DrawingTechPartComponent
  extends ModelEditorComponentBase<DrawingTechPart>
  implements OnInit
{
  // TODO: add your form controls here, e.g.:
  // public tag: FormControl<string | null>;
  // public text: FormControl<string | null>;

  // drawing-tech-materials
  public readonly materialEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // drawing-tech-features
  public readonly featureEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // drawing-tech-techniques
  public readonly techniqueEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // drawing-tech-colors
  public readonly colorEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // drawing-tech-size-units
  public readonly sizeUnitEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // drawing-tech-dim-tags
  public readonly dimTagEntries = signal<ThesaurusEntry[] | undefined>(undefined);
  // drawing-tech-measure-names
  public readonly measureNameEntries = signal<ThesaurusEntry[] | undefined>(undefined);

  constructor(authService: AuthJwtService, formBuilder: FormBuilder) {
    super(authService, formBuilder);
    // form
    // TODO: create your form controls (but NOT the form itself), e.g.:
    // this.tag = formBuilder.control(null, Validators.maxLength(100));
    // this.text = formBuilder.control('', Validators.required, { nonNullable: true });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      // TODO: assign your created form controls to the form returned here, e.g.:
      // tag: this.tag,
      // text: this.text,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    // TODO: setup thesauri entries here, e.g.:
    // const key = 'note-tags';
    // if (this.hasThesaurus(key)) {
    //  this.tagEntries.set(thesauri[key].entries);
    // } else {
    //  this.tagEntries.set(undefined);
    // }
  }

  private updateForm(part?: DrawingTechPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    // TODO: set values of your form controls, e.g.:
    // this.tag.setValue(part.tag || null);
    // this.text.setValue(part.text);
    this.form.markAsPristine();
  }

  protected override onDataSet(data?: EditedObject<DrawingTechPart>): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): DrawingTechPart {
    let part = this.getEditedPart(DRAWING_TECH_PART_TYPEID) as DrawingTechPart;
    // TODO: assign values to your part properties from form controls, e.g.:
    // part.tag = this.tag.value || undefined;
    // part.text = this.text.value?.trim() || '';
    return part;
  }
}
