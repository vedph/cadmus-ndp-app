import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrQuireLabelsComponent } from './cod-fr-quire-labels.component';

describe('CodFrQuireLabelsComponent', () => {
  let component: CodFrQuireLabelsComponent;
  let fixture: ComponentFixture<CodFrQuireLabelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrQuireLabelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrQuireLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
