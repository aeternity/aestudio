
import { Component, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription, asapScheduler } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth/auth.service'
import { HttpClient } from '@angular/common/http';



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

  logTemp(input: any){
    console.log("current input:", input);
  }

  constructor(
    private compiler: CompilerService, 
    private changeDetectorRef: ChangeDetectorRef, 
    private http: HttpClient,
    private auth: AuthService
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

    this.initACI.functions[0].arguments.forEach(oneArg => {
      console.log("Ein arg: ", oneArg.currentInputData)
      params.push(oneArg.currentInputData)
    });

    console.log("_existingContract ist ", _existingContract);
    console.log("addressOfExistingContract ist ", this.addressOfExistingContract);
    // make compiler emit event
    // take the ACI/ContractBase the compiler stores
    // "If the user is trying to interact with an existing contract and something is in the address field, try bringing up the existing contract, else deploy a new one"
    _existingContract && this.addressOfExistingContract.length > 50 ? this.compiler.compileAndDeploy(params, this.addressOfExistingContract) : this.compiler.compileAndDeploy(params);   
  } 


  ngOnInit() {
    //this.buildAContract();
    
     setInterval(async () => {
     
     // call with "false" to query faucet for balance if it's too low
       this.currentSDKsettings != undefined ? await this.getAllBalances(true) : true}, 3000
    ) 
    this.getAllBalances(true);

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
    this.compiler._newACI
        .subscribe(item => {/* console.log("Neue ACI für init ist da !") */
        console.log("Sidebar recieved an ACI!", item)
        // if the new ACI is not {} (empty), reset the last reported error.
        if(Object.entries(item['aci']).length > 0) {
          this.initACI = item['aci'];
          
          this.currentError = {};
          
          // check if there is an init function present for the current generated ACI Trainee TODO task: do this in template !
          this.initACI.name != undefined ? this.initFunctionIsPresent = this.checkIfInitFunctionIsPresent() : true

          console.log("Current error ist nun: ", this.currentError);
          //this.initACI == null ? console.log("Jetzt init ACI leer!") : true;
          this.changeDetectorRef.detectChanges()
        } else {
          // if there was obviously not an ACI recieved, make deployment window disappear
          this.initACI = null
        }

    });

    // fires with a new contract when it got deployed
    this.contractDeploymentSubscription = this.compiler._notifyDeployedContract
      .subscribe( async newContract => {
        
        // workaround for event firing on its own when loading the editor, thereby not sending any data: 
      if(newContract != null) {
           // push contract in an array, later, when calling a function, find it by is address
        // in this array
       /*  let theContractAddress = newContract.deployInfo.address;
        this.activeContracts[theContractAddress] = newContract; */
        //newContract.expanded = false;
        this.activeContracts.push(newContract);
            
        // temp test
        console.log("Current array of contracts: ", this.activeContracts);

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

  this.getSDKsettings();
  //await this.compiler.activeContracts[0].methods[_theFunction].apply(null, params);
}

// get all balances from all addresses currently added to SDK
// @param dontFillUp: boolean - if passed, do not top up accounts if one or some are low
async getAllBalances(_dontFillUp? : boolean){
  //console.log("verfügbare addresses: ", this.currentSDKsettings.addresses)
 
  /* for (let i = 0; i<this.currentSDKsettings.addresses.length; i++ ) {
    console.log("having that many accounts: ", i);
    console.log("fetching for account: ", this.currentSDKsettings.addresses[i])
    this.currentSDKsettings.balances[i] = await this.getOneBalance(this.currentSDKsettings.addresses[i], false);
    console.log("Die balances sind: ", this.currentSDKsettings.balances);
  } */
 
  this.currentSDKsettings.addresses.forEach(async (oneAddress) => {
    this.currentSDKsettings.balances[oneAddress] = await this.getOneBalance(oneAddress, _dontFillUp != true ? false : true);
  }) 
}

// get balance of only one address
// TODO: option parameter einbauen, Format ist 
// async ƒ balance(address, { height, hash, format = false } = {})
async getOneBalance(_address: string, _dontFillUp: boolean, _height?: number, _format?: boolean, _hash?: any, ){
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

  getSDKsettings = () => { this.compiler.sendSDKsettings()}
  
  
  
checkIfInitFunctionIsPresent() : boolean { 
  var found : boolean  = false

  this.initACI.functions.forEach(oneFunction => {
    oneFunction.name == 'init' ? found = true : null
  })

  console.log("Init found ? ", found)

  return found
}




}

