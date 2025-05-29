import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CompilerService } from '../compiler.service';
import { CodeFactoryService } from '../code-factory.service';
import { EventlogService } from '../services/eventlog/eventlog.service';
import { IPopup } from 'ngx-ng2-semantic-ui';
import { ContractWithMethodsExtended } from '../helpers/interfaces';

@Component({
  selector: 'app-deployed-contract',
  templateUrl: './deployed-contract.component.html',
  styleUrls: ['./deployed-contract.component.css'],
})
export class DeployedContractComponent implements OnInit {
  @Input() contract: ContractWithMethodsExtended;
  @Output() deleteContract = new EventEmitter<any>();

  panelOpen: boolean;
  deleteDialogOpen = false;

  constructor(
    private compiler: CompilerService,
    private codeFactory: CodeFactoryService,
    private eventlog: EventlogService,
  ) {}

  ngOnInit() {
    //console.log("Passed contract: ");
    //console.log(this.contract);
    //this.contract.aci = this.contract.aci.contract;
    this.contract.addressPreview =
      this.contract.deployInfo.address.substring(0, 6) +
      ' . . . ' +
      this.contract.deployInfo.address.slice(-3);
  }

  public openPopup(popup: IPopup, _payable: any) {
    /* console.log("Message triggered, function index:", functionIndex)
    console.log("In aci gefunden:", this.contract.aci.functions[functionIndex].payable ) */
    console.log('doOpen is', _payable);
    if (this.compiler.txAmountInAettos > 0 && _payable == false) popup.open();
  }

  public closePopup(popup: IPopup) {
    popup.close();
  }

  async callFunction(_theFunction: string, _theFunctionIndex: number, _contractIDEindex: number) {
    const theContract = this.contract;

    console.log('theContract is:', theContract.$aci.functions[0]);
    // activate loader
    theContract.$aci.functions[_theFunctionIndex].loading = true;

    // fetch all entered params

    const callParams: any[] = this.contract.$aci.functions[_theFunctionIndex].arguments.map(
      (oneArg) => {
        console.log('One arg:', oneArg.currentInputData);
        // try parsing input data as JSON to try handling complex input data cases - work in progess !
        if (typeof oneArg.type === 'object') return JSON.parse(oneArg.currentInputData);
        return oneArg.currentInputData;
      },
    );

    // check if custom values are applied for tx value, gas and gas price, and if so, set them
    const txParams: any = { interval: 500, blocks: 3, allowUnsynced: true };
    console.log('Compiler: amount:', this.compiler.txAmountInAettos);
    console.log('Compiler: gasAmountInUnits:', this.compiler.gasAmountInUnits);
    console.log('Compiler: gasPriceInAettos:', this.compiler.gasPriceInAettos);

    if (this.compiler.txAmountInAettos > 0) txParams.amount = this.compiler.txAmountInAettos;
    if (this.compiler.gasAmountInUnits > 0) txParams.gas = this.compiler.gasAmountInUnits;
    if (this.compiler.gasPriceInAettos > 0) txParams.gasPrice = this.compiler.gasPriceInAettos;

    // "Apply" parameters a.k.a call function
    console.log('Called function:', _theFunction);
    let callresult;
    try {
      console.log('Calling with tx params:', txParams);
      /* callresult = await this.compiler.activeContracts[_contractIDEindex].methods[_theFunction](...callParams, { interval: 500, blocks: 3, allowUnsynced: true, amount: "0", gasPrice:"2000000000", gas:80 }); */
      callresult = await this.compiler.activeContracts[_contractIDEindex][_theFunction](
        ...callParams,
        txParams,
      );
      console.log('The callresult object:', callresult);
      console.log('Decoded result', callresult.decodedResult);
      //this.logMessage(_theFunction + " called successfully :" + JSON.stringify(callresult, null, 2), "success",  this.contract._name)
      // handle "false" result case not displaying call result data
      if (callresult.decodedResult == false) callresult.decodedResult = 'false';

      /*    Handle various result types !
      false: done
      true: Test
      numbers: todo
      complex types: todo */

      this.contract.$aci.functions[_theFunctionIndex].lastReturnData = callresult.decodedResult;

      this.eventlog.log({
        type: 'success',
        message: _theFunction + ': Call successfull',
        data: callresult,
      });
    } catch (e) {
      console.log('Error was:', e);

      if (e.decodedError != undefined) {
        //this.logMessage(_theFunction + " - call errored: " + e.returnType + " - Decoded error message: " + e.decodedError, "error",  this.contract._name)
        this.contract.$aci.functions[_theFunctionIndex].lastReturnData =
          'Call errored/aborted, see console';
        this.eventlog.log({ type: 'error', message: 'Call failure', data: e });
      } else {
        this.contract.$aci.functions[_theFunctionIndex].lastReturnData =
          'Call errored/aborted, see console';
        this.eventlog.log({
          type: 'error',
          message:
            _theFunction +
            ' - call errored: ' +
            e /* + " Most likely there is a syncing issue in the load balanced testnet nodes, please re-deploy the contract and try again. "  */,
          data: e,
        });
      }
    }
    //deactivate loader
    this.contract.$aci.functions[_theFunctionIndex].loading = false;

    // set decoded result to GUI

    console.log('Loader ist:', this.contract.$aci.functions[_theFunctionIndex].loading);
    console.log(
      'Das wurde als callresult geschrieben:',
      this.contract.$aci.functions[_theFunctionIndex].lastReturnData,
    );
  }

  callCodeFactory(
    _theContractCode: string,
    _theFunction: {
      name: string;
      arguments: { currentInputData: string }[];
    },
    _initParams: unknown[] = [],
  ) {
    console.log('Contract:', this.contract);
    this.codeFactory.contract$.next({
      sourceCode: _theContractCode,
      deployParams: _initParams,
      entrypointName: _theFunction.name,
      entrypointParams: _theFunction.arguments.map(({ currentInputData }) => currentInputData),
    });
  }

  deleteTheContract() {
    this.deleteContract.emit(this.contract);
    console.log('Deployed-Contract.component: Emitting delete event');
  }

  copyAddress() {
    navigator.clipboard
      .writeText(this.contract.deployInfo.address)
      .then(() => {
        console.log('Text copied to clipboard');
      })
      .catch((err) => {
        // This can happen if the user denies clipboard permissions:
        console.error('Could not copy text:', err);
      });
  }
}
