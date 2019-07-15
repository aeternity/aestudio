import { TestBed } from '@angular/core/testing';

import { ContractControlService } from './contract-control.service';

describe('ContractControlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContractControlService = TestBed.get(ContractControlService);
    expect(service).toBeTruthy();
  });
});
