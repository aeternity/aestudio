import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneLogComponent } from './one-log.component';

describe('OneLogComponent', () => {
  let component: OneLogComponent;
  let fixture: ComponentFixture<OneLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OneLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
