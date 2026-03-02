import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextPassagesPartComponent } from './text-passages-part.component';

describe('TextPassagesPartComponent', () => {
  let component: TextPassagesPartComponent;
  let fixture: ComponentFixture<TextPassagesPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextPassagesPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextPassagesPartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
