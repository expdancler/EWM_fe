import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostiForecastComponent } from './costi-forecast.component';

describe('CostiForecastComponent', () => {
  let component: CostiForecastComponent;
  let fixture: ComponentFixture<CostiForecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostiForecastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostiForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
