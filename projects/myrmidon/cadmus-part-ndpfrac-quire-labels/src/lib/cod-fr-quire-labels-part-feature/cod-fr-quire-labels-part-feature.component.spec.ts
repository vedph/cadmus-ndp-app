import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrQuireLabelsPartFeatureComponent } from './cod-fr-quire-labels-part-feature.component';

describe('CodFrQuireLabelsFeatureComponent', () => {
  let component: CodFrQuireLabelsPartFeatureComponent;
  let fixture: ComponentFixture<CodFrQuireLabelsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrQuireLabelsPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
