import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CompilerService } from '../compiler.service'
import {IPopup} from "ng2-semantic-ui";
import {SuiPopupComponent} from "../sui-popup/sui-popup.component"

@Component({
  selector: 'app-wallet-switch',
  templateUrl: './wallet-switch.component.html',
  styleUrls: ['./wallet-switch.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class WalletSwitchComponent implements OnInit {
  public test = 2;
  constructor(public compiler: CompilerService) { }

  public openPopup(popup:IPopup) {
    !this.compiler.walletExtensionPresent ? popup.open() : true
    }


  public closePopup(popup:IPopup) {
        popup.close();
  }
    ngOnInit(): void {
    }
  

}
