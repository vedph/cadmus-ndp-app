import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFontsPartComponent } from './print-fonts-part.component';

describe('PrintFontsPartComponent', () => {
  let component: PrintFontsPartComponent;
  let fixture: ComponentFixture<PrintFontsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFontsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintFontsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
