import { TestBed } from '@angular/core/testing';

import { ReplServiceService } from './repl-service.service';

describe('ReplServiceService', () => {
  let service: ReplServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
