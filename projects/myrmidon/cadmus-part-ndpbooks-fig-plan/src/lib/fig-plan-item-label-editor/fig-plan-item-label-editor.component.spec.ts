import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigPlanItemLabelEditorComponent } from './fig-plan-item-label-editor.component';

describe('FigPlanItemLabelEditorComponent', () => {
  let component: FigPlanItemLabelEditorComponent;
  let fixture: ComponentFixture<FigPlanItemLabelEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigPlanItemLabelEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FigPlanItemLabelEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
