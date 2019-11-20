import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractInLeftMenuComponent } from './contract-in-left-menu.component';

describe('ContractInLeftMenuComponent', () => {
  let component: ContractInLeftMenuComponent;
  let fixture: ComponentFixture<ContractInLeftMenuComponent>;

  beforeEach(async(() => {
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
