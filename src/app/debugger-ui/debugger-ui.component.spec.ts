import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebuggerUiComponent } from './debugger-ui.component';

describe('DebuggerUiComponent', () => {
  let component: DebuggerUiComponent;
  let fixture: ComponentFixture<DebuggerUiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DebuggerUiComponent]
    });
    fixture = TestBed.createComponent(DebuggerUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
