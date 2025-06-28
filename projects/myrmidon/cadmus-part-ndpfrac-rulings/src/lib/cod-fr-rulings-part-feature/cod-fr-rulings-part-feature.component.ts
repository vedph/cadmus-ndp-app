import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { CodFrRulingsPartComponent } from '../cod-fr-rulings-part/cod-fr-rulings-part.component';

@Component({
  selector: 'cadmus-cod-fr-rulings-part-feature',
  imports: [CurrentItemBarComponent, CodFrRulingsPartComponent],
  templateUrl: './cod-fr-rulings-part-feature.component.html',
  styleUrl: './cod-fr-rulings-part-feature.component.css',
})
export class CodFrRulingsPartFeatureComponent
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
      'cod-fr-ruling-systems',
      'cod-fr-ruling-types',
      'cod-fr-ruling-features',
    ];
  }
}
