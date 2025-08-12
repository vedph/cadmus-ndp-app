import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFontsPartFeatureComponent } from './print-fonts-part-feature.component';

describe('PrintFontsPartFeatureComponent', () => {
  let component: PrintFontsPartFeatureComponent;
  let fixture: ComponentFixture<PrintFontsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFontsPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintFontsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
