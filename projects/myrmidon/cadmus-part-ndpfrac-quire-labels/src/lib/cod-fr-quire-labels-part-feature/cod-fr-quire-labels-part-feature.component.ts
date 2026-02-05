import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { CodFrQuireLabelsPartComponent } from '../cod-fr-quire-labels-part/cod-fr-quire-labels-part.component';

@Component({
  selector: 'cadmus-cod-fr-quire-labels-feature',
  imports: [CodFrQuireLabelsPartComponent, CurrentItemBarComponent],
  templateUrl: './cod-fr-quire-labels-part-feature.component.html',
  styleUrls: ['./cod-fr-quire-labels-part-feature.component.css'],
})
export class CodFrQuireLabelsPartFeatureComponent
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
      'doc-reference-types',
      'doc-reference-tags',
      'assertion-tags',
      'external-id-tags',
      'external-id-scopes',
      'cod-fr-quire-label-types',
      'cod-fr-quire-label-positions',
      'asserted-id-features',
    ];
  }
}
