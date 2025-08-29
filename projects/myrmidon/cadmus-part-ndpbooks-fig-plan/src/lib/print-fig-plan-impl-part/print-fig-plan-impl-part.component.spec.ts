import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFigPlanImplPartComponent } from './print-fig-plan-impl-part.component';

describe('PrintFigPlanImplPartComponent', () => {
  let component: PrintFigPlanImplPartComponent;
  let fixture: ComponentFixture<PrintFigPlanImplPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFigPlanImplPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintFigPlanImplPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
