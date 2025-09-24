import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingTechPartComponent } from './drawing-tech-part.component';

describe('DrawingTechPartComponent', () => {
  let component: DrawingTechPartComponent;
  let fixture: ComponentFixture<DrawingTechPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingTechPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingTechPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
