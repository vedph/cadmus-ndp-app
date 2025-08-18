import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFigPlanPartFeatureComponent } from './print-fig-plan-part-feature.component';

describe('PrintFigPlanPartFeatureComponent', () => {
  let component: PrintFigPlanPartFeatureComponent;
  let fixture: ComponentFixture<PrintFigPlanPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFigPlanPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintFigPlanPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
