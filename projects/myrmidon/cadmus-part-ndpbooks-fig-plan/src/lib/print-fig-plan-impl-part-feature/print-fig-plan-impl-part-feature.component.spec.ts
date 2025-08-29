import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFigPlanImplPartFeatureComponent } from './print-fig-plan-impl-part-feature.component';

describe('PrintFigPlanImplPartFeatureComponent', () => {
  let component: PrintFigPlanImplPartFeatureComponent;
  let fixture: ComponentFixture<PrintFigPlanImplPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFigPlanImplPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintFigPlanImplPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
