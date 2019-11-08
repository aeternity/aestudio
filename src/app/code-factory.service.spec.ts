import { TestBed } from '@angular/core/testing';
import { CodeFactoryService } from './code-factory.service';

describe('CodeFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CodeFactoryService = TestBed.get(CodeFactoryService);
    expect(service).toBeTruthy();
  });
});
