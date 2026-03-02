import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextPassagesPartFeatureComponent } from './text-passages-part-feature.component';

describe('TextPassagesPartFeatureComponent', () => {
  let component: TextPassagesPartFeatureComponent;
  let fixture: ComponentFixture<TextPassagesPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextPassagesPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextPassagesPartFeatureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
