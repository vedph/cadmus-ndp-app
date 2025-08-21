import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigPlanImplItemEditorComponent } from './fig-plan-impl-item-editor.component';

describe('FigPlanImplItemEditorComponent', () => {
  let component: FigPlanImplItemEditorComponent;
  let fixture: ComponentFixture<FigPlanImplItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigPlanImplItemEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FigPlanImplItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
