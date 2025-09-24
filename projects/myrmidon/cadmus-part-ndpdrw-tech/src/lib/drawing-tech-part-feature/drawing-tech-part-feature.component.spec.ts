import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingTechPartFeatureComponent } from './drawing-tech-part-feature.component';

describe('DrawingTechPartFeatureComponent', () => {
  let component: DrawingTechPartFeatureComponent;
  let fixture: ComponentFixture<DrawingTechPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingTechPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingTechPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
