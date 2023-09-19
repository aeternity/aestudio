import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContractInLeftMenuComponent } from './contract-in-left-menu.component';

describe('ContractInLeftMenuComponent', () => {
  let component: ContractInLeftMenuComponent;
  let fixture: ComponentFixture<ContractInLeftMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractInLeftMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractInLeftMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
