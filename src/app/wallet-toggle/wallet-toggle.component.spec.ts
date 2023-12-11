import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletToggleComponent } from './wallet-toggle.component';

describe('WalletToggleComponent', () => {
  let component: WalletToggleComponent;
  let fixture: ComponentFixture<WalletToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletToggleComponent]
    });
    fixture = TestBed.createComponent(WalletToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
