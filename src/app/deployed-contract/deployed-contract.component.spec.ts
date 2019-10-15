import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployedContractComponent } from './deployed-contract.component';

describe('DeployedContractComponent', () => {
  let component: DeployedContractComponent;
  let fixture: ComponentFixture<DeployedContractComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeployedContractComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployedContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
