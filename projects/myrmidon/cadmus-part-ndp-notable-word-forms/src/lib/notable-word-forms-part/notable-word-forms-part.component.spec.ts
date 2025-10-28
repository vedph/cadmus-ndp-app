import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotableWordFormsPartComponent } from './notable-word-forms-part.component';

describe('NotableWordFormsPartComponent', () => {
  let component: NotableWordFormsPartComponent;
  let fixture: ComponentFixture<NotableWordFormsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotableWordFormsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotableWordFormsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
