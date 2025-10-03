import { TestBed } from '@angular/core/testing';

import { ForecastExcelService } from './forecast-excel.service';

describe('ForecastExcelService', () => {
  let service: ForecastExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForecastExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
