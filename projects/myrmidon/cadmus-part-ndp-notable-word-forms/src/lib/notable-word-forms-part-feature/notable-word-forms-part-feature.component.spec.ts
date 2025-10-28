import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotableWordFormsPartFeatureComponent } from './notable-word-forms-part-feature.component';

describe('NotableWordFormsPartFeatureComponent', () => {
  let component: NotableWordFormsPartFeatureComponent;
  let fixture: ComponentFixture<NotableWordFormsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotableWordFormsPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotableWordFormsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
