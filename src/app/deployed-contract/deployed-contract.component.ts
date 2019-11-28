import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service';
import { CodeFactoryService } from '../code-factory.service';
import { BehaviorSubject, Subscription, generate } from 'rxjs';

@Component({
  selector: 'app-deployed-contract',
  templateUrl: './deployed-contract.component.html',
  styleUrls: ['./deployed-contract.component.css']
  
})
export class DeployedContractComponent implements OnInit {

  @Input() contract: any;
  panelOpen: boolean;

  constructor(private compiler: CompilerService, 
              private codeFactory: CodeFactoryService){
   
     }
  
  ngOnInit() {
    console.log("Als contract wurde übergeben: ");
    console.log(this.contract);
    //this.contract.aci = this.contract.aci.contract;
    debugger;
  }


  async callFunction(_theFunction: string, _theFunctionIndex: number, _contractIDEindex: number){
    let theContract = this.contract;
  
    console.log("theContract is: ", theContract.aci.functions[0]);
    // activate loader
    this.contract.aci.functions[_theFunctionIndex].loading = true
  
    console.log("Loader ist: ", this.contract.aci.functions[_theFunctionIndex].loading )
    
    // fetch all entered params
    const jsonTypes = ["map", "list", "tuple", "record", "bytes"]
  
    var params: any[] = this.contract.aci.functions[_theFunctionIndex].arguments.map(oneArg => {
      console.log("One arg: ", oneArg.currentInputData)
      // try parsing input data as JSON to try handling complex input data cases - work in progess !
      if (typeof oneArg.type === "object") return JSON.parse(oneArg.currentInputData)
      return oneArg.currentInputData
    });
    
  
    // "Apply" parameters a.k.a call function
    console.log("Called function: ", _theFunction);
    var callresult;
    try {
      callresult = await this.compiler.activeContracts[_contractIDEindex].methods[_theFunction](...params);
      console.log("The callresult object: ", callresult);
      console.log("Decoded result ", callresult.decodedResult);
      //this.logMessage(_theFunction + " called successfully :" + JSON.stringify(callresult, null, 2), "success",  this.contract.aci.name)
      // handle "false" result case not displaying call result data
      callresult.decodedResult == false ? callresult.decodedResult = "false" : true
      this.contract.aci.functions[_theFunctionIndex].lastReturnData = callresult.decodedResult;
    } catch(e) {
      console.log("Error was: ", e);
      
      if (e.decodedError != undefined) {
        //this.logMessage(_theFunction + " - call errored: " + e.returnType + " - Decoded error message: " + e.decodedError, "error",  this.contract.aci.name)
        this.contract.aci.functions[_theFunctionIndex].lastReturnData = "Call errored/aborted, see console"
      } else {
        //this.logMessage(_theFunction + " - call errored: " + e + " Most likely there is a syncing issue in the load balanced testnet nodes, please re-deploy the contract and try again.",  this.contract.aci.name)
  
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


