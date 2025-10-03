import { TestBed } from '@angular/core/testing';

import { NotificationTostrService } from './notification-toastr.service';

describe('ToastrService', () => {
  let service: NotificationTostrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationTostrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
