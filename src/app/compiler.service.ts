
import { Injectable,Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Universal } from '@aeternity/aepp-sdk'

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import Node from '@aeternity/aepp-sdk/es/node' // or other flavor
import BrowserWindowMessageConnection from "@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message";
import Detector from "@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector";
import {RpcAepp} from "@aeternity/aepp-sdk";

import { ContractBase } from './question/contract-base'
// import { FormControl, FormGroup, Validators } from '@angular/forms';

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'
import publicAccounts from './helpers/prefilled-accounts'
import { EventlogService } from './services/eventlog/eventlog.service'
//import { Wallet, MemoryAccount, Node, Crypto } from '@aeternity/aepp-sdk/es'

var Ae = Universal;


@Injectable({
  providedIn: 'root'
})
export class CompilerService {

  public code: string = ''

  // the code from the currently active compiler window
  aci: ContractBase<any>;

  // aci only for the init function
  initACI: ContractBase<any>;

  // not used yet, just for tabs later: same as ACI, but contains address of deployed contract
  public activeContracts: any[] = [];

  // only ACI, from the code of the currently opened tab
  rawACI: any;

  // the SDK initialization
  public Chain: any;

  public defaultSdkConfig = {};
  public sdkConfigOverrides = {};
  public providerToggleInProcess : boolean = false;
  public walletExtensionPresent : boolean = false;
  public currentBrowser : string = '';
 
  public getAvailableAccounts = () => {
    return this.Chain.addresses();
  }

  public sendSDKsettings = () => { this._notifyCurrentSDKsettings.next(this.getCurrentSDKsettings());}

  // 'amount' for transactions, recieved from tx-values component - set by tx-values-component, 
  // read by one-contract-component when sending TXs
  txAmountInAettos: number = 0;
  gasAmountInUnits: number = 0;
  gasPriceInAettos: number = 0;

  private aciObs: BehaviorSubject < any > = new BehaviorSubject < any > (null);

  private cachedWallet : any = {}

// ____ helpers start 

public nextAci(value: any): void {
  this.aciObs.next(value);
}
public tellAci(): Observable < string > {
  return this.aciObs;
}

public TESTNET_URL = 'https://iris.testnet.aeternity.art/v2/status';
public MAINNET_URL = 'https://mainnet.aeternity.io';
public COMPILER_URL = 'https://compiler.aepps.com';

public aeternity : any = {
  rpcClient: null,
  client: null,
  networkId: null,
  static: true,
  contractAddress: '',
  initProvider : async (changedClient = false) => {
    try {
      const networkId = (await this.aeternity.client.getNodeInfo()).nodeNetworkId;
      const changedNetwork = this.aeternity.networkId !== networkId;
      this.aeternity.networkId = networkId
      if (this.aeternity.contractAddress)
        // this.aeternity.contract = await aeternity.client.getContractInstance(identity, {contractAddress: aeternity.contractAddress});
  
      if (changedClient || changedNetwork) {
        console.log('Compiler: networkChange');
        console.log('Compiler: dataChange');
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};

public scanForWallets = async (successCallback) => {

  const scannerConnection = await BrowserWindowMessageConnection({
    connectionInfo: { id: 'spy' },
  });

  const detector = await Detector({ connection: scannerConnection });

  const handleWallets = async ({ wallets, newWallet }) => {
    detector.stopScan();
    newWallet ? this.cachedWallet = newWallet : true;
    console.log("newwallet: ", newWallet);
    console.log("wallets: ", wallets);
    console.log("cachedWallet", this.cachedWallet);
    console.log("one wallet" , Object.values(wallets)[0])

    const wallet = newWallet ? newWallet : wallets[this.aeternity.detectedWallet];
    this.aeternity.detectedWallet = wallet.id;

    //let connected = await aeternity.rpcClient.connectToWallet(await wallet.getConnection());
    

    //const walletConnection = newWallet ? await newWallet.getConnection() : this.cachedWallet.getConnection()
   
    const connected = await this.Chain.connectToWallet(await wallet.getConnection());
  
    this.Chain.selectNode(connected.networkId); // connected.networkId needs to be defined as node in RpcAepp
    await this.Chain.subscribeAddress('subscribe', 'current');
    this.aeternity.client = this.Chain;
    this.aeternity.static = false;
    await this.aeternity.initProvider(true);
    successCallback();
  };

  detector.scan(handleWallets);
}

public justScanForWallets = async (successCallback) => {
  
  const scannerConnection = await BrowserWindowMessageConnection({
    connectionInfo: { id: 'spy' },
  });

  const detector = await Detector({ connection: scannerConnection });

  const handleWallets = async ({ wallets, newWallet }) => {
    detector.stopScan();
    newWallet ? this.cachedWallet = newWallet : true;
    console.log("newwallet: ", newWallet);
    console.log("wallets: ", wallets);
    console.log("cachedWallet", this.cachedWallet);
    console.log("one wallet" , Object.values(wallets)[0])

    const wallet = newWallet ? newWallet : wallets[this.aeternity.detectedWallet];
    this.aeternity.detectedWallet = wallet.id;
    successCallback();
  };

  detector.scan(handleWallets);
}

public awaitInitializedChainProvider = async () => {
  return new Promise((resolve, reject) => {
    var scanCount = 0
    var check = setInterval(() => {
     
      if(this.Chain && this.Chain.currentWalletProvider){
        clearInterval(check);
        resolve(true)
      } else {
        scanCount++
      }
 },300);
  })
}

public toggleProvider = () => {
  this.providerToggleInProcess = true

  if(this.Chain){
    this.Chain.currentWalletProvider == "extension" ? this.setupWebClient() : this.setupWalletClient();
  }
  
  this.providerToggleInProcess = false
  
}

public onWalletSearchSuccess = async () => {
  console.log("Compiler: Wallet search complete!")
  console.log("Wallet's SDK: ", this.Chain)
  this.Chain.currentWalletProvider = "extension"
  
  console.log("wallet's account?", Object.keys(this.Chain.rpcClient.accounts.current)[0].toString())

  // put data where other components expect it to be
  let sdkSettingsToReport : any= {}
  
  //wallets:

  sdkSettingsToReport.addresses = new Array( Object.keys(this.Chain.rpcClient.accounts.current)[0].toString() )
  sdkSettingsToReport.address = Object.keys(this.Chain.rpcClient.accounts.current)[0].toString()
  sdkSettingsToReport.getNodeInfo = { nodeNetworkId : this.Chain.rpcClient.info.networkId }
  console.log("Compiler: Wallet-SDK settings: ", sdkSettingsToReport)
  this._notifyCurrentSDKsettings.next({type: "extension", settings: sdkSettingsToReport});
}

public setupWalletClient = () => {
  this.initWalletSearch(this.onWalletSearchSuccess);
}

public initWalletSearch = async (successCallback) => {
    // Open iframe with Wallet if run in top window
    // window !== window.parent || await aeternity.getReverseWindow();

  this.Chain = await RpcAepp({
    name: 'AEPP',
    nodes: [
      {name: 'ae_mainnet', instance: await Node({url: this.MAINNET_URL})},
      {name: 'ae_uat', instance: await Node({url: this.TESTNET_URL})}
    ],
    compilerUrl: this.COMPILER_URL,
    onNetworkChange: (params) => {
      console.log('Compiler: wallet network change');
      // TODO: Handle network change 
      // this.selectNode(params.networkId); // params.networkId needs to be defined as node in RpcAepp
      // this.aeternity.initProvider();
    },
    onAddressChange: (addresses) => {
      // if (!addresses.current[this.aeternity.address]) {
        console.log('Compiler: wallet addressChange 2');
      // }
    }
  });

    await this.scanForWallets(successCallback);
}


// ____ helpers end
  
  // Part 2/3 of asking active tab's editor for code - this needs to be triggered by tab component !
 // ask the components to send code
  public makeCompilerAskForCode(_uid: string){
    //console.log("im compiler angekommen");
    this._fetchActiveCode.next(_uid);
  }

  constructor(private http: HttpClient,
    private eventlog: EventlogService) {

    // define the default SDK settings
    var theAccounts : typeof MemoryAccount[] = [];
    this.currentBrowser = this.getBrowserName();

    publicAccounts().forEach(account => {
      let oneAccount = MemoryAccount({keypair: account});
      oneAccount.property = "public";
      theAccounts.push(oneAccount);
    });

    this.defaultSdkConfig = {
      nodeUrl : `${environment.publicTestnetURL}`,
      compilerUrl : `${environment.compilerURL}`,
      accounts : theAccounts
    }

    // on start, initialize the web-based SDK
    this.setupWebClient();

    this.justScanForWallets(() => {this.walletExtensionPresent = true})
    //this.initWalletSearch(this.onWalletSearchSuccess);

   }


   async setupWebClient(_config? : {nodeUrl? : string, compilerUrl? : string, personalAccounts? : boolean, accounts? : typeof MemoryAccount[], command? : string}){

    // if a config is provided, apply its values to the sdkConfigOverrides
  if (_config){
    console.log("Compiler: Received custom config for SDK: ", _config)
    // first, clear old custom config values
    this.sdkConfigOverrides = {};

      Object.keys(_config).forEach(setting => {
      this.sdkConfigOverrides[setting] = _config[setting]
    });
  }

    const nodeInstance = await Node({url: this.defaultOrCustomSDKsetting("nodeUrl")})
    this.Chain = await Ae({
      nodes: [{name: 'Testnet', instance: nodeInstance }],
      compilerUrl: `${this.defaultOrCustomSDKsetting("compilerUrl")}`,
      accounts: this.defaultOrCustomSDKsetting("accounts")
      
    }).catch(e => { console.log("Shit, SDK setup didn't work:", e)})
    // place indicator for whether it's the wallet addon active or just web/testnet accounts etc.
    this.Chain.currentWalletProvider = "web"

    // TODO: wrap in try catch
    let height = await this.Chain.height();
    console.log('Current Block Height: ', height)
    
    // notify sidebar about new SDK settings
    this._notifyCurrentSDKsettings.next(this.getCurrentSDKsettings());
    console.log("Das SDK: ", this.Chain);
   }

   fromCodeToACI(code) {
    let compilerUrl = `${this.defaultOrCustomSDKsetting("compilerUrl")}/aci`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.post<any>(compilerUrl, {"code":`${code}`, "options":{}}, httpOptions);
   }

   getErrorsFromDebugCompiler(code) {
    let compilerUrl = `${environment.debugCompilerURL}/aci`;
    //let compilerUrl = "http://145.239.150.239:3080/aci";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Sophia-Compiler-Version': '4.0.0'
      })
    };
    return this.http.post<any>(compilerUrl, {"code":`${code}`, "options":{}}, httpOptions);
   }

  // emits an event passing data from all SDK functions that take 0 parameters,
  // a.k.a. it reads all data from the SDK
  
   async  getCurrentSDKsettings() : Promise<any> {   
    if (this.Chain != undefined) {
      var returnObject = {};
      var keyCount : number = 0;
      // count the amount of keys with 0 arguments
      for(var key in this.Chain) {
        if(this.Chain[key].length == 0){ 
        //console.log("Calling function:", key)
          keyCount++ } 
      }
  
      // execute all functions by their name which have 0 params.
      // count the length of returns - if it equals the keycount, return.
      for(var key in this.Chain) {
        if(this.Chain[key].length == 0){ 
        //console.log("Calling function:", key)
          returnObject[key] = await this.Chain[key]() 
          if (Object.keys(returnObject).length == keyCount ){
            return returnObject;
          }
        
        } 
    }}}



   

  // converts code to ACI and deploys.
  async compileAndDeploy(_deploymentParams: any[], _existingContractAddress?: string) : Promise<any> {
    console.log("deploying...");

    let sourceCode = this.code
    // code to aci
    //console.log("Hier kommt der code: ", sourceCode);

    // create a contract instance
    var myContract;

    if (!_existingContractAddress) {
      // Here we deploy the contract
      
      myContract = await this.Chain.getContractInstance(this.code);
      //console.log(">>>> compilation result (mycontract): ", myContract);
      
      try {
        console.log("Deployment params: ", _deploymentParams)
        await myContract.deploy( _deploymentParams, { interval: 500, blocks: 3, allowUnsynced: true });
        
        // argument format: logMessage(log: {type: string, message: string, contract?: string, data: {}})
        //  
        
        this.logMessage({type: "success", message: "Contract successfully deployed: " + myContract.aci.name, data: myContract.deployInfo})
        //this.logMessage(" Contract deployed successfully: " + JSON.stringify(myContract.deployInfo, null, 2) , "success", myContract.aci.name )

      } catch(_e){
        console.log("Something went wrong, investigating tx!");
        console.log(_e);

        //this.logMessage(" Deployment failed: " + e, "error",  myContract.aci.name)
        this.logMessage({type: "error", message: "Contract deployment failed: " + myContract.aci.name, data: _e})
        this._notifyDeployedContract.next({newContract: null, success: false});
        return true
        //e.verifyTx();  - is this a thing ? 
         }
    } else {
      //here we want to interact with an existing one.
      myContract = await this.Chain.getContractInstance(this.code, {contractAddress: _existingContractAddress});

      this.logMessage({type: "success", message: "Successfully casted contract at: " + myContract.aci.name, data: myContract.deployInfo})
    }

    console.log("My contract: ", myContract);
    //console.log("My account: ", this.Chain.addresses());
    //console.log("Das ganze SDK: ", this.Chain);

    this.fromCodeToACI(sourceCode)
    .subscribe(
      (data: EncodedACI) => {
      // save ACI to generate a contract instance for the editor
      var rawACI = data.encoded_aci
        
        // now add an index to each function and sort them, just to be sure
        // 1. just to make sure the init func is on top, sort functions.
        
        rawACI.contract.functions.sort(
          (x, y) => { return x.name == 'init' ? -1 : y.name == 'init' ? 1 : 0 }
      )

      // 2. enumerate functions explicitly with index
      rawACI.contract.functions.forEach((one, i) => {

          rawACI.contract.functions[i].IDEindex = i;
          //console.log(one);
          //console.log(i);
      })
      
      // 3.  now that we have it, add additional fields to the ACI (formgroups disabled currently)
      let aci = this.modifyAci(rawACI);

      /* // actually, short-circuit problematic formgroup generation
      let aci = rawACI; */
      console.log("Formatted aci now looks like: ", aci)
      // 4. put the ammended ACi into the aci of the contract object
      myContract.aci = aci;

      
      console.log("Hier final aci object:", aci)
      console.log(aci);
      
      console.log("Hier final contract object:", myContract);
      console.log(myContract);

      this.aci = aci;
      // add an index to allow self-referencing its position in the (contracts?) array..
      myContract.IDEindex = this.activeContracts.length;

      
      // for now, (also) store the contract in compiler. not decided yet where it's better.
      // sidebar currently receives its own contract data via following event subscription:

      this.activeContracts.push(myContract);
      // 5. tell sidebar about the new contract so it can store it
      this._notifyDeployedContract.next({newContract: myContract, success: true});
    },
    error => this.fetchErrorsFromDebugCompiler(sourceCode));
    console.log("fetching error from debug compiler..")

    
    //TODO: check if the contract was successfully deployed by checking the contract object for deployed address
    // TODO: Try working with resolve/reject instead of return true here, to handle deployment failure.
    // TODO: Investigate where the contract in the sidemenu is created - maybe in fromCodeTOAci ? 

    return true;
  }
  async fetchErrorsFromDebugCompiler(sourceCode: string) : Promise<string> {
    return new Promise((resolve,reject)=> {
      console.log("fetching errors...")
    var returnValue;
    this.getErrorsFromDebugCompiler(sourceCode)
    .subscribe(
        (data: EncodedACI) => {},
      error => {console.log("Found the error: ", error.error[0])
      returnValue = error.error[0];
      resolve(returnValue);
      }
    );
    })
    
  }
// params example: {sourceCode: this.activeContract.code, contractUID: this.activeContract.contractUID }
// sourceCode: the contract's source code
// contractUID: the UID of the contract. it is being returned in the event, so one knows which contract this refers to.
 
  async generateACIonly(params : {sourceCode: string, contractUID: string}) : Promise<any> {
    
    //console.log("Compiler erhielt als source: ", params.sourceCode);
    // replace " => \"
    if (params.sourceCode == undefined) { return false}

    var sourceCode = params.sourceCode.replace(new RegExp('"', 'g'), '\"');

    // remove comments
    sourceCode = sourceCode.replace(new RegExp('\\/\\/.*', 'g'), '');
    sourceCode = sourceCode.replace(new RegExp('\\/\\*.*[\s\S]*\\*\\/', 'g'), '');

    // code to aci
    //console.log("Hier kommt der code: ", sourceCode);
    
    // this source code will be used when user clicks deployContract()
    this.code = sourceCode;

    this.fromCodeToACI(sourceCode)
    .subscribe(
      (data: EncodedACI) => {
      // save ACI to generate a contract instance for the editor
      var rawACI = data.encoded_aci
        
        // now add an index to each function and sort them, just to be sure
        // 1. just to make sure the init func is on top, sort functions.
        
        rawACI.contract.functions.sort(
          (x, y) => { return x.name == 'init' ? -1 : y.name == 'init' ? 1 : 0 }
      )

      // 2. enumerate functions explicitly with index
      rawACI.contract.functions.forEach((one, i) => {
          rawACI.contract.functions[i].IDEindex = i;
      })
      
      // 3.  now that we have it, generate the formgroups for the function args
      rawACI = this.modifyAci(rawACI);
      
      //console.log("Hier init ACI object:", this.aci)
      
      //this._newACI.next("good");
      this._newACI.next({aci: rawACI, contractUID: params.contractUID});

      //this._notifyCurrentSDKsettings.next(0);
      
      
      return rawACI;
    },
    async (error) =>  {
      //console.log("oooops fehler ", error.error)
      var theError = await this.fetchErrorsFromDebugCompiler(sourceCode); 
      

      // diese error subscription in den one-editor übertragen, stattdessen errors als Teil der ACI returnen
      // HIER TEST !!
    this._notifyCodeError.next(theError);
 
    this._newACI.next({"aci": {}, "contractUID": params.contractUID, "error": theError});
    

    //Deprecate
    this._notifyCompiledAndACI.next({"aci": {}, "contractUID": params.contractUID, "error": theError});
      
    return true;
  } );
    
    /* 
    eventuell wieder aktivieren !

    this.initACI = {} as ContractBase<any>;

    // tell sidebar et al. that there is no valid contract there right now
    this._notifyCompiledAndACI.next({aci: {}, contractUID: params.contractUID});
    return this.rawACI; */
  }

 

 
  // reactivate this function for eventual input validation later...
 // generates a typescript-safe contract instance with a FormGroup in functions array
 modifyAci(aci: any): ContractBase<any> {
 
  
 // 1. create several formgroups: one FG for each fun, return final contract
  //console.log("ACI hier:", aci);
  let functions = aci.contract.functions;
  // 2. ... for every function of the contract....
  functions.forEach(fun => {
      //onsole.log("Taking care of ", fun.name);
      // add field to later store latest return data
      fun.lastReturnData = '';
      // add field to later store loading state (e.g. transaction being mined or waiting for local call..)
      fun.loading = false
      // 2.5 ...generate a formgroup checking all the params, make the "options" types non-required 
      fun.arguments.forEach((arg, i, allArgs) => {
          let controlls: any = [];
          
          // add field to sotre current input value
          arg.currentInput = '';
          arg.IDEindex = i;
          
          /* controlls[i] = arg.type.option != null ? new FormControl(arg.name || '')
              : new FormControl(arg.name || '', Validators.required);
          //console.log(`For ${arg.name} adding ${controlls.length} controlls`)
              // generate FormGroup from object of form controls and put the FormGroup into functions[].formGroup in ACI structure
          fun.formGroup = new FormGroup(controlls) */
      })
  });
  return new ContractBase(aci);

  //return new ContractBase(untouchedAci);
}




/* listeners start */

 // new observable style testing
 
   // Part 1/3 for asking currently open editor for its code
   public _fetchActiveCode = new BehaviorSubject<string>("");
   oneEvent = this._fetchActiveCode.asObservable();
 
   // DEPRECATE !
   // "new ACI available to generate GUI for contract deployment / init() function "
   public _notifyCompiledAndACI = new BehaviorSubject<object>({});
   newRawACI = this._notifyCompiledAndACI.asObservable();
 
   // New best practice for implementing events
   // Notify on existance of new, formatted/extended api
   public _newACI = new Subject<any>();
   _newACIEvent = this._notifyCompiledAndACI.asObservable();
 
   // New best practice for implementing events
   // Notify on existance of new, formatted/extended api
   public _newLog = new Subject<any>();
   _newLogEvent = this._newLog.asObservable();
 

   // a new contract was deployed!
   public _notifyDeployedContract = new Subject<any>();
   newContract = this._notifyDeployedContract.asObservable();
   
   // (new) SDK settings were found !
   public _notifyCurrentSDKsettings = new BehaviorSubject<any>({});
   newSdkSettings = this._notifyCurrentSDKsettings.asObservable();

   // DEPRECATE !
  // a (new) account was found!
  public _notifyCodeError = new BehaviorSubject<any>({});
  newCodeError = this._notifyCodeError.asObservable();
  
  // notify the editor to display generated code
  public _generateCode = new BehaviorSubject<any>({});
   codeGenerator = this._generateCode.asObservable();
  /* listeners end */

  /* all things sharing related start */
  public activeCodeSelection : any
  /* all things sharing related end */

  logMessage(_log: any) {
    
    //example:
    //this.eventlog.log({type: "success", message: "Contract was called successfully!", contract: "testcontract", data: {}})
    
    this.eventlog.log(_log)
    
  }

  private defaultOrCustomSDKsetting(_setting){
    // if there is no override set, return the default.
    return this.sdkConfigOverrides[_setting] == undefined ? this.defaultSdkConfig[_setting] : this.sdkConfigOverrides[_setting];
  }


  public getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }

}


export class EncodedACI {
  encoded_aci: any;
}
