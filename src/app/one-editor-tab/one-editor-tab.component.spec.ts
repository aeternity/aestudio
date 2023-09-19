import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneEditorTabComponent } from './one-editor-tab.component';

describe('OneEditorTabComponent', () => {
  let component: OneEditorTabComponent;
  let fixture: ComponentFixture<OneEditorTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OneEditorTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneEditorTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
