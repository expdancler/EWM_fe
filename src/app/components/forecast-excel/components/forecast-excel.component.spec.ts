import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastExcelComponent } from './forecast-excel.component';

describe('ForecastExcelComponent', () => {
  let component: ForecastExcelComponent;
  let fixture: ComponentFixture<ForecastExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastExcelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
