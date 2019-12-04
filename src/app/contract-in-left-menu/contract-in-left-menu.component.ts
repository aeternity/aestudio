import { Component, OnInit, Input } from '@angular/core';
import { Contract } from '../contracts/hamster';

@Component({
  selector: 'app-contract-in-left-menu',
  templateUrl: './contract-in-left-menu.component.html',
  styleUrls: ['./contract-in-left-menu.component.css']
})
export class ContractInLeftMenuComponent implements OnInit {

  @Input() public contract: Contract<any>;
  hover: boolean;

  // the label
  styleLabel: any = {
    width: "100%",
    display: "inline-block",
    background: "#1a1b1e"
  }

  /* Right button (delete icon) */
  rightButtonLabel: any = {
    width: "0px",
    height: "100%",
    display: "inline-block"
 
  }


  constructor() {
    this.hover = false;
   }

  ngOnInit() {
  }

  public onHover(){
    console.log("Hover triggered!");

    /* The main Contract menu label */
    this.styleLabel = {
      
      width: "calc(100% - 40px)",
      display: "inline-block",
      background: "#1a1b1e"

    }

    /* The right button */
    this.rightButtonLabel = { 
      width: "40px",
      color: "orange",
     
      height: "100%",
      display: "inline-block"
    }


  }

  public unHover() {
    console.log("unhover triggered!");

    /* The main Contract menu label */

    this.styleLabel = {
      width: "100%",
      display: "inline-block",
      background: "#1a1b1e"
    }


    /* The right button */
    this.rightButtonLabel = { 
      width: "0px",
      color: "orange",
      display: "inline-block",
      height: "100%"
    }
  }
}
