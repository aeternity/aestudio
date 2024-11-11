import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneLogChildComponent } from './one-log-child.component';

describe('OneLogChildComponent', () => {
  let component: OneLogChildComponent;
  let fixture: ComponentFixture<OneLogChildComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OneLogChildComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneLogChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
