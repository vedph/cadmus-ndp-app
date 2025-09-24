import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { DrawingTechPartComponent } from '../drawing-tech-part/drawing-tech-part.component';

@Component({
  selector: 'cadmus-drawing-tech-part-feature',
  imports: [CurrentItemBarComponent, DrawingTechPartComponent],
  templateUrl: './drawing-tech-part-feature.component.html',
  styleUrl: './drawing-tech-part-feature.component.css',
})
export class DrawingTechPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'drawing-tech-materials',
      'drawing-tech-features',
      'drawing-tech-techniques',
      'drawing-tech-colors',
      'drawing-tech-size-units',
      'drawing-tech-dim-tags',
      'drawing-tech-measure-names',
    ];
  }
}
