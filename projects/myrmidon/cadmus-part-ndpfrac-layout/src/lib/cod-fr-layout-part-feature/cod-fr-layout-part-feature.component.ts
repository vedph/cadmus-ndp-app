import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { CodFrLayoutPartComponent } from '../cod-fr-layout-part/cod-fr-layout-part.component';

@Component({
  selector: 'cadmus-cod-fr-layout-part-feature',
  imports: [CurrentItemBarComponent, CodFrLayoutPartComponent],
  templateUrl: './cod-fr-layout-part-feature.component.html',
  styleUrl: './cod-fr-layout-part-feature.component.css',
})
export class CodFrLayoutPartFeatureComponent
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
      'cod-fr-layout-prickings',
      'decorated-count-ids',
      'decorated-count-tags',
      'physical-size-units',
      'physical-size-dim-tags',
    ];
  }
}
