import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSwitchComponent } from './wallet-switch.component';

describe('WalletSwitchComponent', () => {
  let component: WalletSwitchComponent;
  let fixture: ComponentFixture<WalletSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
