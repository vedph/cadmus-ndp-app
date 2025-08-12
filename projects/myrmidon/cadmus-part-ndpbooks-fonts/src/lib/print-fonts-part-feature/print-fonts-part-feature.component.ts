import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { PrintFontsPartComponent } from '../print-fonts-part/print-fonts-part.component';

@Component({
  selector: 'cadmus-print-fonts-part-feature',
  imports: [CurrentItemBarComponent, PrintFontsPartComponent],
  templateUrl: './print-fonts-part-feature.component.html',
  styleUrl: './print-fonts-part-feature.component.css',
})
export class PrintFontsPartFeatureComponent
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
      'print-font-families',
      'print-layout-sections',
      'print-font-features',
      'doc-reference-types',
      'doc-reference-tags',
      'assertion-tags',
      'external-id-tags',
      'external-id-scopes',
    ];
  }
}
