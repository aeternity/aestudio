import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MainloaderComponent } from './mainloader.component';

describe('MainloaderComponent', () => {
  let component: MainloaderComponent;
  let fixture: ComponentFixture<MainloaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MainloaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
