import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CompilerService } from '../compiler.service'

@Component({
  selector: 'app-wallet-switch',
  templateUrl: './wallet-switch.component.html',
  styleUrls: ['./wallet-switch.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class WalletSwitchComponent implements OnInit {

  constructor(public compiler: CompilerService) { }

  ngOnInit(): void {
  }
  

}
