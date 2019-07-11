import { TestBed } from '@angular/core/testing';

import { CompilerService } from './compiler.service';

describe('CompilerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompilerService = TestBed.get(CompilerService);
    expect(service).toBeTruthy();
  });
});
