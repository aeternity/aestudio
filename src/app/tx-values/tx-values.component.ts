import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tx-values',
  templateUrl: './tx-values.component.html',
  styleUrls: ['./tx-values.component.css']
})
export class TxValuesComponent implements OnInit {

   units = {
    "aetto"   :   0,
    "femtoae" :   3,
    "picoae"  :   6,
    "nanoae"  :   9,
    "microae" :   12,
    "milliae" :   15,
    "ae"      :   18,
    "testtesttesttest" : 10
  }

  objectKeys = Object.keys;

  beOpen: boolean = false;
  isDisabled: boolean = false;
  currentInput: number;
  currentValue: number;
  currentUnit: string = "aetto";

  valueChange(e) {
    //this.currentValue < 1 ? this.currentValue = 0 : true
    console.log(this.getCurrentInput())
    this.currentValue = this.currentInput * Math.pow(10, this.units[this.currentUnit])
    console.log("New currentValue: ", this.currentValue)

  }

  getCurrentInput(){
    return this.currentInput > 0 ? this.currentInput : 0
  }

  // also calculates the (new) total !
  setUnit(unit: string){
    console.log(unit)
    this.currentUnit = unit;
    console.log("New multiplier: ", Math.pow(10, this.units[this.currentUnit]))
    this.currentValue = this.currentInput * Math.pow(10, this.units[this.currentUnit])
    console.log("New currentValue: ", this.currentValue)
  }

  constructor() { }

  ngOnInit() {
  }

}
