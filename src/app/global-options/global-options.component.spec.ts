import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalOptionsComponent } from './global-options.component';

describe('GlobalOptionsComponent', () => {
  let component: GlobalOptionsComponent;
  let fixture: ComponentFixture<GlobalOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
