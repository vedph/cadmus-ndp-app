import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { PrintFigPlanPartComponent } from '../print-fig-plan-part/print-fig-plan-part.component';

@Component({
  selector: 'cadmus-print-fig-plan-part-feature',
  imports: [CurrentItemBarComponent, PrintFigPlanPartComponent],
  templateUrl: './print-fig-plan-part-feature.component.html',
  styleUrl: './print-fig-plan-part-feature.component.css',
})
export class PrintFigPlanPartFeatureComponent
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
      'fig-plan-techniques',
      'fig-plan-types',
      'fig-plan-features',
      'asserted-id-scopes',
      'asserted-id-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
    ];
  }
}
