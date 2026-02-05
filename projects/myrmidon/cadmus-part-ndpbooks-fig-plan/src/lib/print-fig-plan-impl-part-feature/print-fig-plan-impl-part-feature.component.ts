import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { PrintFigPlanImplPartComponent } from '../print-fig-plan-impl-part/print-fig-plan-impl-part.component';

@Component({
  selector: 'cadmus-print-fig-plan-impl-part-feature',
  imports: [CurrentItemBarComponent, PrintFigPlanImplPartComponent],
  templateUrl: './print-fig-plan-impl-part-feature.component.html',
  styleUrl: './print-fig-plan-impl-part-feature.component.css',
})
export class PrintFigPlanImplPartFeatureComponent
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
    this.roleIdInThesauri = true;
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'fig-plan-types',
      'fig-plan-impl-positions',
      'fig-plan-impl-change-types',
      'fig-plan-impl-item-features',
      'fig-plan-impl-matrix-types',
      'fig-plan-impl-matrix-states',
      'asserted-id-scopes',
      'asserted-id-tags',
      'assertion-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'physical-size-units',
      'physical-size-tags',
      'physical-size-dim-tags',
      'fig-plan-item-label-types',
      'fig-plan-item-label-languages',
      'print-font-families',
      'print-layout-sections',
      'print-font-features',
      'asserted-id-features',
    ];
  }
}
