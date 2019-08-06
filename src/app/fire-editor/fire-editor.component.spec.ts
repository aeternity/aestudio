import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FireEditorComponent } from './fire-editor.component';

describe('FireEditorComponent', () => {
  let component: FireEditorComponent;
  let fixture: ComponentFixture<FireEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FireEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FireEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
