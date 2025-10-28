import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { NotableWordFormsPartComponent } from '../notable-word-forms-part/notable-word-forms-part.component';

@Component({
  selector: 'cadmus-notable-word-forms-part-feature',
  imports: [NotableWordFormsPartComponent, CurrentItemBarComponent],
  templateUrl: './notable-word-forms-part-feature.component.html',
  styleUrl: './notable-word-forms-part-feature.component.css',
})
export class NotableWordFormsPartFeatureComponent
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
    this.roleIdInThesauri = true;

    return [
      'notable-word-forms-languages',
      'notable-word-forms-tags',
      'notable-word-forms-op-tags',
      'doc-reference-types',
      'doc-reference-tags',
      'pin-link-scopes',
      'pin-link-tags',
      'pin-link-assertion-tags',
      'pin-link-docref-types',
      'pin-link-docref-tags',
    ];
  }
}
