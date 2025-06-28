import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrRulingEditorComponent } from './cod-fr-ruling-editor.component';

describe('CodFrRulingEditorComponent', () => {
  let component: CodFrRulingEditorComponent;
  let fixture: ComponentFixture<CodFrRulingEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrRulingEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrRulingEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
