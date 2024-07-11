import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeBlockWrapperComponent } from './code-block-wrapper.component';

describe('CodeBlockWrapperComponent', () => {
  let component: CodeBlockWrapperComponent;
  let fixture: ComponentFixture<CodeBlockWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CodeBlockWrapperComponent]
    });
    fixture = TestBed.createComponent(CodeBlockWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
