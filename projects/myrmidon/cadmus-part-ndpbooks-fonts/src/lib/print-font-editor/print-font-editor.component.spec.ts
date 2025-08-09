import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintFontEditorComponent } from './print-font-editor.component';

describe('PrintFontEditorComponent', () => {
  let component: PrintFontEditorComponent;
  let fixture: ComponentFixture<PrintFontEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintFontEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintFontEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
