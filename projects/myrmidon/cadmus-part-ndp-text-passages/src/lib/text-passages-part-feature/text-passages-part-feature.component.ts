import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { TextPassagesPartComponent } from '../text-passages-part/text-passages-part.component';

@Component({
  selector: 'cadmus-text-passages-part-feature',
  imports: [CurrentItemBarComponent, TextPassagesPartComponent],
  templateUrl: './text-passages-part-feature.component.html',
  styleUrl: './text-passages-part-feature.component.css',
})
export class TextPassagesPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService,
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService,
    );
  }

  protected override getReqThesauriIds(): string[] {
    this.roleIdInThesauri = true;

    return ['text-passage-tags', 'text-passage-features'];
  }
}
