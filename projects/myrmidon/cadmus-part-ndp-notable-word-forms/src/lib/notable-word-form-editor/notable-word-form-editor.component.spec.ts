import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotableWordFormEditorComponent } from './notable-word-form-editor.component';

describe('NotableWordFormEditorComponent', () => {
  let component: NotableWordFormEditorComponent;
  let fixture: ComponentFixture<NotableWordFormEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotableWordFormEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotableWordFormEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
