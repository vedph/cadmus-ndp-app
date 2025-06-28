import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrRulingsPartFeatureComponent } from './cod-fr-rulings-part-feature.component';

describe('CodFrRulingsPartFeatureComponent', () => {
  let component: CodFrRulingsPartFeatureComponent;
  let fixture: ComponentFixture<CodFrRulingsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrRulingsPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrRulingsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
