import { Component, OnInit } from '@angular/core';
import { CompilerService } from '../compiler.service';

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
  currentValue: number; // this is the essential value !  
  currentUnit: string = "aetto";


  constructor(private compiler: CompilerService) { }

  ngOnInit() {
  }

  valueChange(e) {
    //this.currentValue < 1 ? this.currentValue = 0 : true
    console.log(this.getCurrentInput())
    this.calculateFinalValue();

  }
 

  getCurrentInput(){
    return this.currentInput > 0 ? this.currentInput : 0
  }

  // also calculates the (new) total !
  setUnit(unit: string){
    console.log(unit)
    this.currentUnit = unit;
    console.log("New multiplier: ", Math.pow(10, this.units[this.currentUnit]))
    this.calculateFinalValue();
  }

   calculateFinalValue(){
    this.currentValue = this.currentInput * Math.pow(10, this.units[this.currentUnit])
    console.log("New currentValue: ", this.currentValue)
  }

}
