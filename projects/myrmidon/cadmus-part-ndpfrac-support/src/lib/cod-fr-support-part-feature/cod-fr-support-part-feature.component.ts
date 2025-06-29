import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { CodFrSupportPartComponent } from '../cod-fr-support-part/cod-fr-support-part.component';

@Component({
  selector: 'cadmus-cod-fr-support-part-feature',
  imports: [CurrentItemBarComponent, CodFrSupportPartComponent],
  templateUrl: './cod-fr-support-part-feature.component.html',
  styleUrl: './cod-fr-support-part-feature.component.css',
})
export class CodFrSupportPartFeatureComponent
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
      'cod-fr-support-materials',
      'cod-fr-support-reuse-types',
      'cod-fr-support-containers',
    ];
  }
}
