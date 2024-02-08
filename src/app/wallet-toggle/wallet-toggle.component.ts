import { Component, ViewEncapsulation } from '@angular/core';
import { IProviders } from '../helpers/interfaces';
import { CompilerService } from '../compiler.service';
import { IPopup } from 'ngx-ng2-semantic-ui';

@Component({
  selector: "app-wallet-toggle",
  templateUrl: "./wallet-toggle.component.html",
  styleUrls: ["./wallet-toggle.component.scss"],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class WalletToggleComponent {
  // temporary values to create look and feel:

  provider: IProviders = "web";
  showGliderShadow: boolean = false;
  constructor(public compiler: CompilerService) {}

  setProvider(provider: IProviders) {
    this.provider = provider;
  }
  // mouseover done like this and not CSS because the element is at a lower z-index than the labels

  showShadow(show: boolean) {
    this.showGliderShadow = show;
  }

  public openPopup(popup: IPopup) {
    !this.compiler.walletExtensionPresent ? popup.open() : true;
  }

  public closePopup(popup: IPopup) {
    popup.close();
  }
}
