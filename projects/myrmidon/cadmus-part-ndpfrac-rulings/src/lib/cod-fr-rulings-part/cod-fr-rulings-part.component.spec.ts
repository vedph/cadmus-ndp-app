import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrRulingsPartComponent } from './cod-fr-rulings-part.component';

describe('CodFrRulingsPartComponent', () => {
  let component: CodFrRulingsPartComponent;
  let fixture: ComponentFixture<CodFrRulingsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrRulingsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrRulingsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
