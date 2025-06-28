import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrQuireLabelsPartComponent } from './cod-fr-quire-labels-part.component';

describe('CodFrQuireLabelsComponent', () => {
  let component: CodFrQuireLabelsPartComponent;
  let fixture: ComponentFixture<CodFrQuireLabelsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrQuireLabelsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
