import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrQuireLabelEditorComponent } from './cod-fr-quire-label-editor.component';

describe('CodFrQuireLabelEditorComponent', () => {
  let component: CodFrQuireLabelEditorComponent;
  let fixture: ComponentFixture<CodFrQuireLabelEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrQuireLabelEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
