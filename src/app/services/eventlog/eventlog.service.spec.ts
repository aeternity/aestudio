import { TestBed } from '@angular/core/testing';

import { EventlogService } from './eventlog.service';

describe('EventlogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventlogService = TestBed.get(EventlogService);
    expect(service).toBeTruthy();
  });
});
