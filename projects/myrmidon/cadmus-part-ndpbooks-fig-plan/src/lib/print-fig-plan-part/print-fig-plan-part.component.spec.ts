import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFigPlanPartComponent } from './print-fig-plan-part.component';

describe('PrintFigPlanPartComponent', () => {
  let component: PrintFigPlanPartComponent;
  let fixture: ComponentFixture<PrintFigPlanPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFigPlanPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintFigPlanPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
