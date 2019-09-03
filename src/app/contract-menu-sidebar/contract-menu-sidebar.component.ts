
import { Component, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { FormGroup }        from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { SuiModule } from 'ng2-semantic-ui';
//mport { SuiMultiSelect } from 'ng2-semantic-ui/dist';
import { SuiMultiSelect } from 'ng2-semantic-ui/dist';

import { HttpClient } from '@angular/common/http';

//import 'rxjs/add/operator/map';


import { delay, share } from 'rxjs/operators';
//import 'rxjs/add/operator/toPromise';


@Pipe({name: 'replace'})
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {

    if(!value || ! strToReplace || ! replacementStr)
    {
      return value;
    }

 return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
}

@Component({
  selector: 'contract-menu-sidebar',
  templateUrl: './contract-menu-sidebar.component.html',
  styleUrls: ['./contract-menu-sidebar.component.css']/* ,
  providers: [ CompilerService ] */
})


export class ContractMenuSidebarComponent implements OnInit {

  // dropdown start

@ViewChild('gitLibSelector', {static: true})
gitLibSelector: SuiMultiSelect<any, any>;

  options: any = [{id: 3980326, node_id: "MDEwOlJlcG9zaXRvcnkzOTgwMzI2", name: "dfdf", full_name: "patmanpp/gdfdg"},{id: 3980326, node_id: "MDEwOlJlcG9zaXRvcnkzOTgwMzI2", name: "dff", full_name: "patmanpp/gdfdg"},{id: 3980326, node_id: "MDEwOlJlcG9zaXRvcnkzOTgwMzI2", name: "sd2345", full_name: "patmanpp/gdfdg"},{id: 3980326, node_id: "MDEwOlJlcG9zaXRvcnkzOTgwMzI2", name: "2345465", full_name: "patmanpp/gdfdg"},]

  libsLookUp = async (query: string, initial: number) =>  {
    return this.options
  }

  lib_formatter(option: any, query?: string): string {
     //console.log(option);
    return option.name;
  }

  log_option(name: string){
    console.log(name);

  }

  exportchange(event: any) {
    console.log(event);
  }
// dropdown end

  //Fires when new SDK settings are available(Accounts, )
  sdkSettingsSubscription: Subscription;

  //Fires when a raw ACI is available (for gnerating init()'s interface
  rawACIsubscription: Subscription;

  // fires when a contract is deployed: 
  contractDeploymentSubscription: Subscription;

  //displays loading icon when deploying contract
  deploymentLoading: boolean = false;
  
// TODO: wrap in class for automatic type checking bullshit
  /*the current SDK settings. Currently supported: 
    .address - public address of the current active account in SDK instance
    .addresses[] - public addresses of all currently added accounts in instance
    .balances[address -> balance] - (provided by this component) map of balances of all AE accounts currently added to SDK

  
*/
  currentSDKsettings: any = {address: '', addresses: [], balances: [2], getNodeInfo: {url: ''}} 

  activeContracts: any[] = [];
  initACI: ContractBase<any>;

  // mess around:
  temp: any;

  logTemp(input: any){
    console.log(input);
  }

  constructor(private compiler: CompilerService, private changeDetectorRef: ChangeDetectorRef) { }
 
  buildAContract() {
    // make compiler emit event

    // @parm: Maybe use param for editor identification later
    this.compiler.makeCompilerAskForCode(1);

  } 

  deployContract() {

    console.log("Testing: ", this.compiler.Chain.addresses());

    // display loading
    this.deploymentLoading = true;
    this.changeDetectorRef.detectChanges()

      // fetch all entered params
    let params: any[] = [];

    this.initACI.functions[0].arguments.forEach(oneArg => {
      console.log("Ein arg: ", oneArg.currentInputData)
      params.push(oneArg.currentInputData)
    });

    // make compiler emit event
    // take the ACI/ContractBase the compiler stores
    this.compiler.compileAndDeploy(params);
    
/*     setTimeout(() => {
      console.log("Hier kommts:");
      this.aci = this.compiler.aci;
      console.log(this.aci);
    }, 10000); */
     
    
  } 

  ngOnInit() {
    this.buildAContract();
  
  /*  this.subscription = this.compiler._fetchActiveCode
     .subscribe(item => console.log("Event in sidebar angekommen"));
*/

    /* //fetch available account(s) from compiler service
    this.availableAccounts = this.compiler.Chain.addresses();
    console.log("Could fetch addresses: ", this.availableAccounts);
*/

    // fires when SDK/chain settings are changed


    // fires when new accounts are available
    this.sdkSettingsSubscription = this.compiler._notifyCurrentSDKsettings
        .subscribe(async settings => {
        // wait for promise to resolve
        await settings;

        this.currentSDKsettings = settings.__zone_symbol__value;
        //console.log("gingen die settings durch? ", this.currentSDKsettings); 

        // the following ternary operators here are to silence errors that come from angular firing events 
        // on load (a.k.a.) too early, trying to set stuff in here before the "var currentSDKsettings" 
        // is even instantiated. stupid crazy racing conditions of angular or whatever.

        //  append SDKsettings object with properties that the compiler does not provide
        this.currentSDKsettings != undefined ? this.currentSDKsettings.balances = [] : true
        
        //  Get balances of all available addresses
        this.currentSDKsettings != undefined ? await this.getAllBalances() : true

        console.log("This is what currentSDKsettings now look like:", this.currentSDKsettings);

      });

    // fires when new contract got compiled
     this.rawACIsubscription = this.compiler._notifyCompiledAndACI
        .subscribe(item => {/* console.log("Neue ACI für init ist da !") */
          this.initACI = this.compiler.initACI;
          console.log("Hier kommt init aci:", this.initACI);
          this.changeDetectorRef.detectChanges()
    });

    // fires with a new contract when it got deployed
    this.contractDeploymentSubscription = this.compiler._notifyDeployedContract
      .subscribe( async newContract => {

        // woraround for event firing on its own when loading the editor, thereby not sending any data: 
      if(newContract != null) {
           // push contract in an array, later, when calling a function, find it by is addres
        // in this array
       /*  let theContractAddress = newContract.deployInfo.address;
        this.activeContracts[theContractAddress] = newContract; */

        this.activeContracts.push(newContract);
            
        // temp test
        console.log("Current array of contracts: ", this.activeContracts);

        console.log("Reading data from contracts - Name: ", this.activeContracts[0].aci.name)
        console.log("Reading data from contracts - functions: ", this.activeContracts[0].aci.functions)
        console.log("Reading data from contrct -  IDEindex: ", newContract.IDEindex)
      console.log("try self-referencing ?", this.activeContracts[newContract.IDEindex]);
        // trigger this to generate the GUI for the contract
        this.deploymentLoading = false;
        //this.activeContracts = this.compiler.activeContracts;
        this.changeDetectorRef.detectChanges()
        } else {
          console.log("False alert...");
        }
       
      })
}

//desparate workaround for issue: contract to deploy is not being rendered since adding node choosing interface

 
async callFunction(_theFunction: string, _theFunctionIndex: number, _contractIDEindex: number){

  let theContract = this.activeContracts[_contractIDEindex];

  console.log("theContract is: ", theContract.aci.functions[0]);
  // activate loader
  this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].loading = true
  this.changeDetectorRef.detectChanges()

  //this.changeDetectorRef.detectChanges()
  console.log("Loader ist: ", this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].loading )
  
  // fetch all entered params
  var params: any[] = [];

  this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].arguments.forEach(oneArg => {
    console.log("Ein arg: ", oneArg.currentInputData)
    params.push(oneArg.currentInputData)
  });


  // "Apply" parameters a.k.a call function
  console.log("Called function: ", _theFunction);

  let callresult = await this.compiler.activeContracts[_contractIDEindex].methods[_theFunction].apply(null, params);
  console.log("Das call object: ", callresult);
  console.log("Hier kommt callresult: ", callresult.decodedResult);

  //deactivate loader
  this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].loading = false
  //this.changeDetectorRef.detectChanges()

  
  // set decoded result to GUI
  this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].lastReturnData = callresult.decodedResult;
  this.changeDetectorRef.detectChanges()
  console.log("Loader ist: ", this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].loading )
  console.log("Das wurde als callresult geschrieben: ", this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].lastReturnData)
    
}

async changeActiveAccount(newAccount: any) {
  console.log("So wird der neue account gesetzt: ", newAccount);
  
}

async changeSDKsetting(setting: string, params: any){

  switch (setting) {
    case "selectAccount":
      this.compiler.Chain.selectAccount(params);
      console.log("Attempted to change selectAccount: ", setting, params)
      break;

    default:
      console.log("Attempted to change a setting that no switch case matched for: ", setting, params)
      break;
  }

  this.getSDKsettings();
  //await this.compiler.activeContracts[0].methods[_theFunction].apply(null, params);
}

// get all balances from all addresses currently added to SDK
async getAllBalances(){
  //console.log("verfügbare addresses: ", this.currentSDKsettings.addresses)
  this.currentSDKsettings.addresses.forEach(async (oneAddress) => {
    this.currentSDKsettings.balances[oneAddress] = await this.getOneBalance(oneAddress);
  })
}

// get balance of only one address
// TODO: option parameter einbauen, Format ist 
// async ƒ balance(address, { height, hash, format = false } = {})
async getOneBalance(_address: string, _height?: number, _format?: boolean, _hash?: any, ){
  
  // if only the address is defined, don't call with options.
  if (!_height && !_format && !_hash ) {
    var balance = await this.compiler.Chain.balance(_address);
  } else {
    // TODO: Implement calling with options here
  }
  
  return balance;
  }

  getSDKsettings = () => { this.compiler.sendSDKsettings()}

}

