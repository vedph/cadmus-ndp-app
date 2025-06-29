import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrSupportPartFeatureComponent } from './cod-fr-support-part-feature.component';

describe('CodFrSupportPartFeatureComponent', () => {
  let component: CodFrSupportPartFeatureComponent;
  let fixture: ComponentFixture<CodFrSupportPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrSupportPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrSupportPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
