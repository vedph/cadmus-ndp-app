import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrLayoutPartFeatureComponent } from './cod-fr-layout-part-feature.component';

describe('CodFrLayoutPartFeatureComponent', () => {
  let component: CodFrLayoutPartFeatureComponent;
  let fixture: ComponentFixture<CodFrLayoutPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrLayoutPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrLayoutPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
