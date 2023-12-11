import { Component } from '@angular/core';

@Component({
  selector: "app-wallet-toggle",
  templateUrl: "./wallet-toggle.component.html",
  styleUrls: ["./wallet-toggle.component.scss"],
})
export class WalletToggleComponent {
  // temporary values to create look and feel:

  testnet: boolean = true;
  wallet: boolean = false;
  debugger: boolean = false;
}
