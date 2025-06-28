import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrQuireLabelsFeatureComponent } from './cod-fr-quire-labels-part-feature.component';

describe('CodFrQuireLabelsFeatureComponent', () => {
  let component: CodFrQuireLabelsFeatureComponent;
  let fixture: ComponentFixture<CodFrQuireLabelsFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrQuireLabelsFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelsFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
