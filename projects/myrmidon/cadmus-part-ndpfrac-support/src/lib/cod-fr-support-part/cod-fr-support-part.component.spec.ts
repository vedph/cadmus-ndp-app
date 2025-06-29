import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrSupportPartComponent } from './cod-fr-support-part.component';

describe('CodFrSupportPartComponent', () => {
  let component: CodFrSupportPartComponent;
  let fixture: ComponentFixture<CodFrSupportPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrSupportPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrSupportPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
