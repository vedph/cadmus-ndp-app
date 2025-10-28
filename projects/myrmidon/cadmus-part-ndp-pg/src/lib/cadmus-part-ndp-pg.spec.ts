import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadmusPartNdpPg } from './cadmus-part-ndp-pg';

describe('CadmusPartNdpPg', () => {
  let component: CadmusPartNdpPg;
  let fixture: ComponentFixture<CadmusPartNdpPg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadmusPartNdpPg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadmusPartNdpPg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
