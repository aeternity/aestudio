
import { Injectable,Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import Node from '@aeternity/aepp-sdk/es/node' // or other flavor


import { ContractBase } from './question/contract-base'
// import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContractACI } from '@aeternity/aepp-sdk/es/contract/aci'
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
 
  public getAvailableAccounts = () => {
    return this.Chain.addresses();
  }

  public sendSDKsettings = () => { this._notifyCurrentSDKsettings.next(this.getCurrentSDKsettings());}


  private aciObs: BehaviorSubject < any > = new BehaviorSubject < any > (null);

// ____ helpers start 

public nextAci(value: any): void {
  this.aciObs.next(value);
}
public tellAci(): Observable < string > {
  return this.aciObs;
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
    var theAccounts : MemoryAccount[] = [];

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

    this.setupClient();
    //console.log("Compilerservice initialized!");  
   }

  async setupClient(_config? : {nodeUrl? : string, compilerUrl? : string, personalAccounts? : boolean, accounts? : MemoryAccount[], command? : string}){

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

    // todo: wrap in try catch
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
        'Content-Type':  'application/json', 
        'Sophia-Compiler-Version': '4.0.0'
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
 
    // execute all functions by their name, which have 0 params
    for(var key in this.Chain) {
      if(this.Chain[key].length == 0){ 
      //console.log("Calling function:", key)
      returnObject[key] = await this.Chain[key]()  } 
    }}
  
      return returnObject;
   }


  // converts code to ACI and deploys.
  async compileAndDeploy(_deploymentParams: any[], _existingContractAddress?: string) : Promise<any> {
    console.log("deploying...");

    let sourceCode = this.code
    // this is seemingly being taken care of by the node now.
   /*  // replace " => \"
    sourceCode = sourceCode.replace(new RegExp('"', 'g'), '\"');

    // remove comments
    sourceCode = sourceCode.replace(new RegExp('\\/\\/.*', 'g'), '');
    sourceCode = sourceCode.replace(new RegExp('\\/\\*.*[\s\S]*\\*\\/', 'g'), '');
 */
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
        await myContract.deploy(... _deploymentParams);
        
        // argument format: logMessage(log: {type: string, message: string, contract?: string, data: {}})
        //  
        
        this.logMessage({type: "success", message: "Contract successfully deployed: " + myContract.aci.name, data: myContract.deployInfo})
        
        //this.logMessage(" Contract deployed successfully: " + JSON.stringify(myContract.deployInfo, null, 2) , "success", myContract.aci.name )

      } catch(_e){
        console.log("Something went wrong, investigating tx!");
        console.log(_e);

        //this.logMessage(" Deployment failed: " + e, "error",  myContract.aci.name)
        this.logMessage({type: "error", message: "Contract deployment failed: " + myContract.aci.name, data: _e})

        //e.verifyTx();  - is this a thing ? 
         }
    } else {
      //here we want to interact with an existing one.
      myContract = await this.Chain.getContractInstance(this.code, {contractAddress: _existingContractAddress});

      this.logMessage({type: "success", message: "Successfully casted contract at: " + myContract.aci.name, data: myContract.deployInfo})
    }

    console.log("My contract: ", myContract);
    console.log("My account: ", this.Chain.addresses());
    console.log("Das ganze SDK: ", this.Chain);

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
      // add an index to allow self-referencing its position in the array..
      myContract.IDEindex = this.activeContracts.length;

      
      // for now, (also) store in compiler. not decided yet where it's better.
      // sidebar currently references the contracts stored in this compiler service
      // for function calls.
      this.activeContracts.push(myContract);
      // 5. tell sidebar about the new contract so it can store it
      this._notifyDeployedContract.next(myContract);
    },
    error => this.fetchErrorsFromDebugCompiler(sourceCode));
    console.log("fetching error from debug compiler..")

    
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
}


export class EncodedACI {
  encoded_aci: any;
}
