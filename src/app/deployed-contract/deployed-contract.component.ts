import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service';
import { CodeFactoryService } from '../code-factory.service';
import { BehaviorSubject, Subscription, generate } from 'rxjs';
import { EventlogService } from '../services/eventlog/eventlog.service'
import {IPopup} from "ng2-semantic-ui";


@Component({
  selector: 'app-deployed-contract',
  templateUrl: './deployed-contract.component.html',
  styleUrls: ['./deployed-contract.component.css']
  
})
export class DeployedContractComponent implements OnInit {

  @Input() contract: any;
  panelOpen: boolean;

  constructor(private compiler: CompilerService, 
              private codeFactory: CodeFactoryService,
              private eventlog: EventlogService){
   
     }
  
  ngOnInit() {
    //console.log("Passed contract: ");
    //console.log(this.contract);
    //this.contract.aci = this.contract.aci.contract;
    this.contract.addressPreview = this.contract.deployInfo.address.substring(0,6) + ' . . . ' +  this.contract.deployInfo.address.slice(-3)
  }

  public openPopup(popup:IPopup, _payable: any) {
    /* console.log("Message triggered, function index:", functionIndex)
    console.log("In aci gefunden:", this.contract.aci.functions[functionIndex].payable ) */
    console.log("Als doOpen kam: ", _payable)
    if(this.compiler.txAmountInAettos > 0 && _payable == false)
        popup.open();
}

public closePopup(popup:IPopup) {
      popup.close();
}

  async callFunction(_theFunction: string, _theFunctionIndex: number, _contractIDEindex: number){
    let theContract = this.contract;
  
    console.log("theContract is: ", theContract.aci.functions[0]);
    // activate loader
    theContract.aci.functions[_theFunctionIndex].loading = true
  
    console.log("Loader ist: ", theContract.aci.functions[_theFunctionIndex].loading )
    
    // fetch all entered params
    const jsonTypes = ["map", "list", "tuple", "record", "bytes"]
  
    var callParams: any[] = this.contract.aci.functions[_theFunctionIndex].arguments.map(oneArg => {
      console.log("One arg: ", oneArg.currentInputData)
      // try parsing input data as JSON to try handling complex input data cases - work in progess !
      if (typeof oneArg.type === "object") return JSON.parse(oneArg.currentInputData)
      return oneArg.currentInputData
    });

    // check if custom values are applied for tx value, gas and gas price, and if so, set them
    var txParams:any = { interval: 500, blocks: 3, allowUnsynced: true }
    console.log("Compiler: amount: ", this.compiler.txAmountInAettos )
    console.log("Compiler: gasAmountInUnits: ", this.compiler.gasAmountInUnits )
    console.log("Compiler: gasPriceInAettos: ", this.compiler.gasPriceInAettos )

    this.compiler.txAmountInAettos > 0 ? txParams.amount = this.compiler.txAmountInAettos : true
    this.compiler.gasAmountInUnits > 0 ? txParams.gas = this.compiler.gasAmountInUnits : true
    this.compiler.gasPriceInAettos > 0 ? txParams.gasPrice = this.compiler.gasPriceInAettos : true
  
    // "Apply" parameters a.k.a call function
    console.log("Called function: ", _theFunction);
    var callresult;
    try {

      console.log('Calling with tx params:', txParams)
      /* callresult = await this.compiler.activeContracts[_contractIDEindex].methods[_theFunction](...callParams, { interval: 500, blocks: 3, allowUnsynced: true, amount: "0", gasPrice:"2000000000", gas:80 }); */
      callresult = await this.compiler.activeContracts[_contractIDEindex].methods[_theFunction](...callParams, txParams);
      console.log("The callresult object: ", callresult);
      console.log("Decoded result ", callresult.decodedResult);
      //this.logMessage(_theFunction + " called successfully :" + JSON.stringify(callresult, null, 2), "success",  this.contract.aci.name)
      // handle "false" result case not displaying call result data
      callresult.decodedResult == false ? callresult.decodedResult = "false" : true
      this.contract.aci.functions[_theFunctionIndex].lastReturnData = callresult.decodedResult;

      this.eventlog.log({type:"success", message:"Call successfull", data: callresult})


    } catch(e) {
      console.log("Error was: ", e);
      
      if (e.decodedError != undefined) {
        //this.logMessage(_theFunction + " - call errored: " + e.returnType + " - Decoded error message: " + e.decodedError, "error",  this.contract.aci.name)
        this.contract.aci.functions[_theFunctionIndex].lastReturnData = "Call errored/aborted, see console"
        this.eventlog.log({type:"error", message:"Call failure", data: e})

      } else {
        this.contract.aci.functions[_theFunctionIndex].lastReturnData = "Call errored/aborted, see console"
        this.eventlog.log({type:"error", message: _theFunction + " - call errored: " + e + " Most likely there is a syncing issue in the load balanced testnet nodes, please re-deploy the contract and try again. " , data: e})
      }
    }
    //deactivate loader
    this.contract.aci.functions[_theFunctionIndex].loading = false
    
    // set decoded result to GUI
    
    console.log("Loader ist: ", this.contract.aci.functions[_theFunctionIndex].loading );
    console.log("Das wurde als callresult geschrieben: ", this.contract.aci.functions[_theFunctionIndex].lastReturnData);
  }
  
  callCodeFactory(_theContractCode: string, _theFunctionName: string, _theParams: any) {
    this.codeFactory.generateCode(_theContractCode, _theFunctionName, _theParams);
  }
  
  logTemp(something: any){
    true
  }

}


