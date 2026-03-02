import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextPassageEditorComponent } from './text-passage-editor.component';

describe('TextPassageEditorComponent', () => {
  let component: TextPassageEditorComponent;
  let fixture: ComponentFixture<TextPassageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextPassageEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextPassageEditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
