
import { Component, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription, asapScheduler } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth/auth.service'
import { HttpClient } from '@angular/common/http';

import {IPopup} from "ngx-ng2-semantic-ui";
/* 
import { Console } from 'node:console'; */



/* @Pipe({name: 'replace'})
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {

    if(!value || ! strToReplace || ! replacementStr)
    {
      return value;
    }

 return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
} */

@Component({
  selector: 'contract-menu-sidebar',
  templateUrl: './contract-menu-sidebar.component.html',
  styleUrls: ['./contract-menu-sidebar.component.css']
})


export class ContractMenuSidebarComponent implements OnInit {

  // deleteme: Testing the modal UI
  testName: string = "FooBarContractLOL"
  testAddress: string = "ak_1337Cafe....3A7FgK8Hg"

  //Fires when new SDK settings are available(Accounts, )
  sdkSettingsSubscription: Subscription;
  // listen for new errors
  newErrorSubscription: Subscription;

  //Fires when a raw ACI is available (for gnerating init()'s interface
  rawACIsubscription: Subscription;

  // fires when a contract is deployed: 
  contractDeploymentSubscription: Subscription;

  //displays loading icon when deploying contract
  deploymentLoading: boolean = false;
  
  // the current compilation error
  currentError: any = {};

  // is an init function present in the contract ?
  initFunctionIsPresent : boolean = true;

  // the address of the existing contract the user wants to interact with.
  addressOfExistingContract : string = "";

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

  // angular 9
  hover: boolean;

  logTemp(input: any){
    console.log("current input:", input);
  }

  constructor(
    public compiler: CompilerService, 
    private changeDetectorRef: ChangeDetectorRef, 
    private http: HttpClient,
    private auth: AuthService,
    ) { }
 
 /*  buildAContract() {
    // make compiler emit event

    // @parm: Maybe use param for editor identification later
    this.compiler.makeCompilerAskForCode(1);

  }  */

  deployContract(_existingContract? : boolean) {

    // display loading
    this.deploymentLoading = true;
    this.changeDetectorRef.detectChanges()
    
    // fetch all entered params
    let params: any[] = [];

    console.log("Function 0 ist: ", this.initACI.functions[0])
    
    this.initACI.functions[0].arguments.forEach(oneArg => {
      //debugger
      console.log("Ein arg: ", oneArg.currentInput)
      params.push(oneArg.currentInput)
    });

    // take care of the case when init function is not present: 
    if (this.initACI.functions[0].name !== "init") {
      params = null
    }

    console.log("_existingContract ist ", _existingContract);
    console.log("addressOfExistingContract ist ", this.addressOfExistingContract);
    // make compiler emit event
    // take the ACI/ContractBase the compiler stores
    // "If the user is trying to interact with an existing contract and something is in the address field, try bringing up the existing contract, else deploy a new one"
    _existingContract && this.addressOfExistingContract.length > 50 ? this.compiler.compileAndDeploy(params, this.addressOfExistingContract) : this.compiler.compileAndDeploy(params);   
  }
  copyAddress() {
    navigator.clipboard.writeText(this.currentSDKsettings.address)
    .then(() => {
      console.log('Text copied to clipboard');
    })
    .catch(err => {
      // This can happen if the user denies clipboard permissions:
      console.error('Could not copy text: ', err);
    });
  }

  async ngOnInit () {
    //this.buildAContract();
    
    await this.compiler.awaitInitializedChainProvider()
    this.changeDetectorRef.detectChanges()

     setInterval(async () => {
     
     // call with "false" to query faucet for balance if it's too low
       this.currentSDKsettings != undefined ? await this.fetchAllBalances(true) : true}, 3000
    ) 


    this.fetchAllBalances(true);

    // fires when new accounts are available
    this.sdkSettingsSubscription = this.compiler._notifyCurrentSDKsettings
        .subscribe(async settings => {
          console.log("settings: ", settings)
          if(settings.type == "extension") {
            //comming from the browser wallet
            this.currentSDKsettings = settings.settings
            console.log("gingen die settings durch? ", this.currentSDKsettings ); 
          } else {
             //comming from the web wallet
             this.currentSDKsettings = settings;
             console.log("gingen die settings durch? ", this.currentSDKsettings ); 
          }

          
/* 
        if(settings instanceof ZoneAwarePromise) {
          // case: Web SDK     
          // wait for promise to resolve
          
        } else {
          // case: wallet extension, where we put together the SDK settings object on our own
         
        }
 */
     

        // the following ternary operators here are to silence errors that come from angular firing events 
        // on load (a.k.a.) too early, trying to set stuff in here before the "var currentSDKsettings" 
        // is even instantiated. stupid crazy racing conditions of angular or whatever.

        //  append SDKsettings object with properties that the compiler does not provide
        this.currentSDKsettings != undefined ? this.currentSDKsettings.balances = [] : true
        
        //  Get balances of all available addresses
        this.currentSDKsettings != undefined ? await this.fetchAllBalances() : true

        console.log("This is what currentSDKsettings now look like:", this.currentSDKsettings);

      });

    // fires when new contract got compiled
    this.compiler._newACI
        .subscribe(item => {/* console.log("Neue ACI für init ist da !") */
        console.log("Sidebar recieved an ACI!", item)
        this.changeDetectorRef.detectChanges()
        // if the new ACI is not {} (empty), reset the last reported error.
        if(Object.entries(item['aci']).length > 0) {
          this.initACI = item['aci'];
          
          this.currentError = {};
          
          // check if there is an init function present for the current generated ACI Trainee TODO task: do this in template !
          this.initACI.name != undefined ? this.initFunctionIsPresent = this.checkIfInitFunctionIsPresent() : true

          console.log("Current error is: ", this.currentError);
          //this.initACI == null ? console.log("Jetzt init ACI leer!") : true;
          this.changeDetectorRef.detectChanges()
        } else {
          // if there was obviously not an ACI received, make deployment window disappear
          this.initACI = undefined
        }

    });

    // fires with a new contract when it got deployed
    this.contractDeploymentSubscription = this.compiler._notifyDeployedContract
      .subscribe( async ({newContract, success}) => {

        if(!success){
          this.deploymentLoading = false;
        }
        
        // workaround for event firing on its own when loading the editor, thereby not sending any data: 
      if(newContract != null) {
        console.log("New contract: ", newContract) // .deployInfo.address
        this.activeContracts.push(newContract);
            
        // temp test
        //console.log("Current array of contracts: ", this.activeContracts);

        // trigger this to generate the GUI for the contract
        this.deploymentLoading = false;
        //this.activeContracts = this.compiler.activeContracts;
        //debugger
        this.changeDetectorRef.detectChanges()
        } else {
          console.log("False alert...");
          //debugger
        }
       
      })

    this.newErrorSubscription = this.compiler._notifyCodeError
    .subscribe(async error =>  {
        await error;
        //let theError = error.__zone_symbol__value;
        console.log("Nur error in sidebar: ", error);
        this.currentError = error;

    })  

}

//desparate workaround for issue: contract to deploy is not being rendered since adding node choosing interface

 
async changeActiveAccount(newAccount: any) {
  console.log("So wird der neue account gesetzt: ", newAccount);
  
}

async changeSDKsetting(setting: string, params: any){
  console.log("changesetting was clicked")

  switch (setting) {
    case "selectAccount":
      this.compiler.Chain.selectAccount(params);
      console.log("Attempted to change selectAccount: ", setting, params)
      break;

    default:
      console.log("Attempted to change a setting that no switch case matched for: ", setting, params)
      break;
  }

  this.compiler.sendSDKsettings();
}

// get all balances from all addresses currently added to SDK
// @param dontFillUp: boolean - if passed, do not top up accounts if one or some are low
async fetchAllBalances(_dontFillUp? : boolean){
  //console.log("available addresses: ", this.currentSDKsettings.addresses)

  this.currentSDKsettings.addresses.forEach(async (oneAddress) => {
    this.currentSDKsettings.balances[oneAddress] = await this.getOneBalance(oneAddress, _dontFillUp != true ? false : true);
  }) 
}

// get balance of only one address
// TODO: option parameter einbauen, Format ist 
// async ƒ balance(address, { height, hash, format = false } = {})
async getOneBalance(_address: string, _dontFillUp: boolean, _height?: number, _format?: boolean, _hash?: any){
  // if only the address is defined, don't call with options.
  var balance;
  //console.log("Fetching balan ce for..." + _address);
  if (!_height && !_format && !_hash ) {
    try {
      balance = await this.compiler.Chain.getBalance(_address);
      //console.log("als balance für " + _address + " kam:", balance);
      this.changeDetectorRef.detectChanges();
    } catch(e) {
      balance = 0;
      this.changeDetectorRef.detectChanges();

    }
  
  } else {
    // TODO: Implement calling with options here
  }
  //console.log("Balance returned für " + _address +" :", balance);
  this.changeDetectorRef.detectChanges();

  return balance;
  }

  
checkIfInitFunctionIsPresent() : boolean { 
  var found : boolean  = false

  this.initACI.functions.forEach(oneFunction => {
    oneFunction.name == 'init' ? found = true : null
  })

  console.log("Init found ? ", found)

  return found
}

deleteFromActiveContracts = (contract) => { 
  console.log("utils.deleteFromActiveContracts: delete event angekommen")
  console.log("delete contract:", contract)
  console.log("this.activeContracts:", this.activeContracts)

  this.activeContracts.forEach((element, index) => {
    if (element.IDEindex == contract.IDEindex) {
      console.log("Found contract to delete, existing: ", element.IDEindex, "to delete: ", contract.IDEindex)
      this.activeContracts.splice(index,1);
    }
  })
  /* for (var i = this.activeContracts.length - 1; i >= 0; --i) {
      
  } */
}


}

