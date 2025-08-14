import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigPlanItemEditorComponent } from './fig-plan-item-editor.component';

describe('FigPlanItemEditorComponent', () => {
  let component: FigPlanItemEditorComponent;
  let fixture: ComponentFixture<FigPlanItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigPlanItemEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FigPlanItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
