import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contract } from '../contracts/hamster';
//import { EventEmitter } from 'protractor';

@Component({
  selector: 'app-contract-in-left-menu',
  templateUrl: './contract-in-left-menu.component.html',
  styleUrls: ['./contract-in-left-menu.component.css'],
})
export class ContractInLeftMenuComponent {
  @Input() public contract: Contract;
  @Output() public contractDeletion: any = new EventEmitter();
  @Output() public showInTabs = new EventEmitter();

  hover: boolean;
  toggled = false;

  // the label
  styleLabel: any = {
    width: '100%',
    display: 'inline-block',
    background: '#1a1b1e',
  };

  /* Right button (delete icon) */
  rightButtonLabel: any = {
    width: '0px',
    height: '100%',
    display: 'inline-block',
  };

  constructor() {
    this.hover = false;
  }

  public onHover() {
    //console.log("Hover triggered!");

    /* The main Contract menu label */
    this.styleLabel = {
      width: 'calc(100% - 40px)',
      display: 'inline-block',
      background: '#1a1b1e',
    };

    /* The right button */
    this.rightButtonLabel = {
      width: '40px',
      color: '#D12754',

      height: '100%',
      display: 'inline-block',
    };
  }

  public unHover() {
    /* The main Contract menu label */

    this.styleLabel = {
      width: '100%',
      display: 'inline-block',
      background: '#1a1b1e',
    };

    /* The right button */
    this.rightButtonLabel = {
      width: '0px',
      color: '#D1275',
      display: 'inline-block',
      height: '100%',
    };
  }

  public toggleDeleteDialog() {
    this.toggled = !this.toggled;
  }

  public deleteContract() {
    this.contractDeletion.emit(this.contract);
  }

  public displayInTabs() {
    console.log('showintabs called');
    this.showInTabs.emit(this.contract);
  }
}
