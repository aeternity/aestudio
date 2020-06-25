import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiPopupComponent } from './sui-popup.component';

describe('SuiPopupComponent', () => {
  let component: SuiPopupComponent;
  let fixture: ComponentFixture<SuiPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuiPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuiPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
