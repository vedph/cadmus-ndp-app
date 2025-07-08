import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodFrLayoutPartComponent } from './cod-fr-layout-part.component';

describe('CodFrLayoutPartComponent', () => {
  let component: CodFrLayoutPartComponent;
  let fixture: ComponentFixture<CodFrLayoutPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodFrLayoutPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodFrLayoutPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
