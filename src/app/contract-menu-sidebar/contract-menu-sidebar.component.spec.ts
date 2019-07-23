import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractMenuSidebarComponent } from './contract-menu-sidebar.component';

describe('ContractMenuSidebarComponent', () => {
  let component: ContractMenuSidebarComponent;
  let fixture: ComponentFixture<ContractMenuSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractMenuSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractMenuSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
