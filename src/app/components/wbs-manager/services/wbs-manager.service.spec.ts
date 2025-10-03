import { TestBed } from '@angular/core/testing';

import { WbsManagerService } from './wbs-manager.service';

describe('WbsManagerService', () => {
  let service: WbsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WbsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
