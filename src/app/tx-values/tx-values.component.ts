import { Component } from '@angular/core';
import { CompilerService } from '../compiler.service';
import { AuthService } from '../services/auth/auth.service';
import { IPopup } from 'ngx-ng2-semantic-ui';

@Component({
  selector: 'app-tx-values',
  templateUrl: './tx-values.component.html',
  styleUrls: ['./tx-values.component.css'],
})
export class TxValuesComponent {
  units = {
    aetto: 0,
    femtoae: 3,
    picoae: 6,
    nanoae: 9,
    microae: 12,
    milliae: 15,
    ae: 18,
  };

  objectKeys = Object.keys;

  beOpen = false;
  isDisabled = false;
  currentInput: number;
  currentValue: number; // this is the essential value !
  currentUnit = 'aetto';

  gasRadioButton = false;
  manualGasValue: number;
  lastManualGasValue = 1337;

  gasPriceRadioButton = false;
  manualGasPriceValue: number;
  lastManualGasPriceValue = 1000000000;

  constructor(
    public compiler: CompilerService,
    public auth: AuthService,
  ) {}

  valueChange() {
    //this.currentValue < 1 ? this.currentValue = 0 : true
    //console.log(this.getCurrentInput())
    this.calculateFinalValue();
  }

  private showLoginNotification = true;

  public openPopup(popup: IPopup) {
    if (!this.auth.theUser && this.compiler.Chain.currentWalletProvider == 'web') {
      popup.open();
    }
  }

  public closePopup(popup: IPopup) {
    popup.close();
  }

  manualGasChange() {
    //this.currentValue < 1 ? this.currentValue = 0 : true
    this.compiler.gasAmountInUnits = this.manualGasValue;
    console.log(this.manualGasValue);
    console.log(this.compiler.gasAmountInUnits);
    // set to compiler !
  }

  toggleGasRadioButton() {
    console.log('Clicked, toggle:', this.gasRadioButton);
    const newValue = this.manualGasValue;
    const oldValue = this.lastManualGasValue;

    if (this.gasRadioButton) {
      this.lastManualGasValue = newValue;
      this.manualGasValue = oldValue;
      this.compiler.gasAmountInUnits = this.manualGasValue;
    }

    if (!this.gasRadioButton) {
      this.lastManualGasValue = newValue;
      this.manualGasValue = null;
      this.compiler.gasAmountInUnits = 0;
    }
  }

  manualGasPriceChange() {
    //this.currentValue < 1 ? this.currentValue = 0 : true
    this.compiler.gasPriceInAettos = this.manualGasPriceValue;
    console.log(this.manualGasPriceValue);

    // set to compiler !
  }

  toggleGasPriceRadioButton() {
    console.log('Price Clicked, toggle:', this.gasPriceRadioButton);
    const newValue = this.manualGasPriceValue;
    const oldValue = this.lastManualGasPriceValue;

    if (this.gasPriceRadioButton) {
      this.lastManualGasPriceValue = newValue;
      this.manualGasPriceValue = oldValue;
      this.compiler.gasPriceInAettos = this.manualGasPriceValue;
    }

    if (!this.gasPriceRadioButton) {
      this.lastManualGasPriceValue = newValue;
      this.manualGasPriceValue = null;
      this.compiler.gasPriceInAettos = 0;
    }
  }

  getCurrentInput() {
    return this.currentInput > 0 ? this.currentInput : 0;
  }

  // also calculates the (new) total !
  setUnit(unit: string) {
    console.log(unit);
    this.currentUnit = unit;
    console.log('New multiplier:', Math.pow(10, this.units[this.currentUnit]));
    this.calculateFinalValue();
  }

  calculateFinalValue() {
    this.currentValue = this.currentInput * Math.pow(10, this.units[this.currentUnit]);
    this.compiler.txAmountInAettos = this.currentValue;
    console.log('New currentValue:', this.currentValue);
  }
}
