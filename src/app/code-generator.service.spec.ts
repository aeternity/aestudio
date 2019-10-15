import { TestBed } from '@angular/core/testing';

import { CodeGeneratorService } from './code-generator.service';

describe('CodeGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CodeGeneratorService = TestBed.get(CodeGeneratorService);
    expect(service).toBeTruthy();
  });
});
