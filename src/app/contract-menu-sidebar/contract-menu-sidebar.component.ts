
import { Component, ViewChild, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { FormGroup }        from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { SuiModule } from 'ng2-semantic-ui';
//mport { SuiMultiSelect } from 'ng2-semantic-ui/dist';
import { SuiMultiSelect } from 'ng2-semantic-ui/dist';
import { environment } from '../../environments/environment';
import {LogMessage as NgxLogMessage} from 'ngx-log-monitor';

import { HttpClient, HttpHeaders } from '@angular/common/http';

//import 'rxjs/add/operator/map';


import { delay, share } from 'rxjs/operators';
import fetchRandomAccounts from '../helpers/prefilled-accounts';
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

 
// dropdown end

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

  constructor(private compiler: CompilerService, private changeDetectorRef: ChangeDetectorRef, private http: HttpClient) { }
 
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
  } 


  ngOnInit() {
    this.buildAContract();
    
     setInterval(async () => {
     //console.log("Feteching balance in interval...");
     // call with "false" to query faucet for balance if it's too low
       this.currentSDKsettings != undefined ? await this.getAllBalances(true) : true}, 6000
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
     this.rawACIsubscription = this.compiler._notifyCompiledAndACI
        .subscribe(item => {/* console.log("Neue ACI für init ist da !") */
          this.initACI = this.compiler.initACI;
          console.log("Hier kommt init aci:", this.initACI);
          // if the new ACI is not {} (empty), reset the last reported error.
          if(Object.entries(this.initACI).length > 0) { 
            this.currentError = {};
          }
          console.log("Current error ist nun: ", this.currentError);
          //this.initACI == null ? console.log("Jetzt init ACI leer!") : true;
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
        //newContract.expanded = false;
        this.activeContracts.push(newContract);
            
        // temp test
        console.log("Current array of contracts: ", this.activeContracts);

        // trigger this to generate the GUI for the contract
        this.deploymentLoading = false;
        //this.activeContracts = this.compiler.activeContracts;
        this.changeDetectorRef.detectChanges()
        } else {
          console.log("False alert...");
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
  var callresult;
  try {
    callresult = await this.compiler.activeContracts[_contractIDEindex].methods[_theFunction].apply(null, params);
    console.log("Das callresult object: ", callresult);
    console.log("Hier kommt callresult: ", callresult.decodedResult);
    this.logMessage(_theFunction + " called successfully :" + JSON.stringify(callresult, null, 2), "success",  this.activeContracts[_contractIDEindex].aci.name)
    this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].lastReturnData = callresult.decodedResult;
  } catch(e) {
    console.log("Error war: ", e);
    this.logMessage(_theFunction + " - call errored: " + e.returnType + " - Decoded error message: " + e.decodedError, "error",  this.activeContracts[_contractIDEindex].aci.name)
    this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].lastReturnData = "Call errored/aborted, see console"
  }
  //deactivate loader
  this.activeContracts[_contractIDEindex].aci.functions[_theFunctionIndex].loading = false
  //this.changeDetectorRef.detectChanges()

  
  // set decoded result to GUI
  
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
    //console.log("Don't fill up ist: ", _dontFillUp)
    // in case the balance is too low or zero, fill up the account
    /* if (balance < 1000000000000000000 && _dontFillUp != true){
     console.log("Balance low, filling up from faucet..")
     let httpOptions = {
      headers: new HttpHeaders({
        'sec-fetch-mode':' cors' ,
        'dnt':' 1' ,
        'accept-encoding':' gzip, deflate, br' ,
        'accept-language':' de,en-US;q=0.9,en;q=0.8,de-DE;q=0.7,et;q=0.6' ,
        'user-agent':' Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36' ,
        'accept':' application/json' ,
        'referer':' https://testnet.faucet.aepps.com/',
        'authority':' testnet.faucet.aepps.com' ,
        'sec-fetch-site':' same-origin' ,
        'content-length':' 0' ,
        'origin':' https://testnet.faucet.aepps.com'

      })
    };
    try{ 
     let query = await this.http.post<any>(`${environment.testnetFaucetUrl}${_address}`, {}, httpOptions).subscribe(resp => {
       console.log("Antwort vom faucet: ", query);
       this.getAllBalances(true);
       
       this.changeDetectorRef.detectChanges();
       

     })
     console.log("Response vom faucet: ",query);

    } catch(e){
      console.log("...error from querying faucet");
    }

    } */
  } else {
    // TODO: Implement calling with options here
  }
  //console.log("Balance returned für " + _address +" :", balance);
  this.changeDetectorRef.detectChanges();

  return balance;
  }

  getSDKsettings = () => { this.compiler.sendSDKsettings()}

  logMessage(_message: string, _type: string, _contract? : string) {
    let hours = new Date().getHours().toString();
    let minutes = new Date().getMinutes().toString();
    let time = hours + ':' + minutes;
    var log : NgxLogMessage;

    switch (_type) {
      case "log" :
        log = {timestamp: time , message: _contract + ':'  + _message , type: 'LOG'}
        this.compiler.logs.push(log);
        break;
      case "warn" :
        log = {timestamp: time , message: _contract + ':'  + _message , type: 'WARN'}
        this.compiler.logs.push(log);  
        break;
      case "success" :
        log = {timestamp: time , message: _contract + ':'  + _message , type: 'SUCCESS'}
        this.compiler.logs.push(log); 
        break;
      case "error" :
        log = {timestamp: time , message: _contract + ':'  + _message , type: 'ERR'}
        this.compiler.logs.push(log); 
        break;
      case "info" :
        log = {timestamp: time , message: _contract + ':'  + _message , type: 'INFO'}
        this.compiler.logs.push(log); 
        break;
      default:
        break;
    }
  }
}

