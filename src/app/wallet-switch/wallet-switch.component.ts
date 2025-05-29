import { Component, ViewEncapsulation } from '@angular/core';
import { CompilerService } from '../compiler.service';
import { IPopup } from 'ngx-ng2-semantic-ui';

@Component({
  selector: 'app-wallet-switch',
  templateUrl: './wallet-switch.component.html',
  styleUrls: ['./wallet-switch.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class WalletSwitchComponent {
  constructor(public compiler: CompilerService) {}

  public openPopup(popup: IPopup) {
    if (!this.compiler.walletExtensionPresent) popup.open();
  }

  public closePopup(popup: IPopup) {
    popup.close();
  }
}
