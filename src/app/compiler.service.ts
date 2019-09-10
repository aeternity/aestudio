
import { Injectable,Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';


import { Crypto } from '@aeternity/aepp-sdk/es/';

import { Contract } from './contracts/hamster';
import { ContractBase } from './question/contract-base'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContractACI } from '@aeternity/aepp-sdk/es/contract/aci'
import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'
import publicAccounts from './helpers/prefilled-accounts'

//import { Wallet, MemoryAccount, Node, Crypto } from '@aeternity/aepp-sdk/es'

var Ae = Universal;

@Injectable({
  providedIn: 'root'
})
export class CompilerService {

  // setting default code, later pulled from editor
  //code: string = new Contract().code;
  
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
 
  public getAvailableAccounts = () => {
    return this.Chain.addresses();
  }

  public sendSDKsettings = () => { this._notifyCurrentSDKsettings.next(this.getCurrentSDKsettings());}



  
  // Part 2/3 of asking active tab's editor for code - this needs to be triggered by tab component !
 // ask the components to send code
  public makeCompilerAskForCode(number){
    //console.log("im compiler angekommen");
    this._fetchActiveCode.next(number);
  }

  constructor(private http: HttpClient) {
    this.setupClient();
    //console.log("Compilerservice initialized!");  
   }

  async setupClient(){
    console.log("The random accounts: ", publicAccounts());

    let theAccounts = [];
    publicAccounts().forEach(account => {
      theAccounts.push(MemoryAccount({keypair: account}))
    });

    // Use Flavor   
    this.Chain = await Ae({
      url: 'https://sdk-testnet.aepps.com',
      //internalUrl: 'http://localhost:3001/internal/',
      //compilerUrl: 'http://localhost:3080',
      compilerUrl: `${environment.compilerURL}`,
      nativeMode: true,
      accounts: theAccounts 
      
      /* [
          MemoryAccount({ keypair: { secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca', publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU' } }),
          MemoryAccount({ keypair: { secretKey: '7c6e602a94f30e4ea7edabe4376314f69ba7eaa2f355ecedb339df847b6f0d80575f81ffb0a297b7725dc671da0b1769b1fc5cbe45385c7b5ad1fc2eaf1d609d', publicKey: 'ak_fUq2NesPXcYZ1CcqBcGC3StpdnQw3iVxMA3YSeCNAwfN4myQk' } }),
          MemoryAccount({ keypair: { secretKey: '7fa7934d142c8c1c944e1585ec700f671cbc71fb035dc9e54ee4fb880edfe8d974f58feba752ae0426ecbee3a31414d8e6b3335d64ec416f3e574e106c7e5412', publicKey: 'ak_tWZrf8ehmY7CyB1JAoBmWJEeThwWnDpU4NadUdzxVSbzDgKjP' } }),
        ]  */ 
      //networkId: 'ae_devnet' // or any other networkId your client should connect to
    }).catch(e => { console.log("Shit, it didn't work:", e)})


    // todo: wrap in try catch
    let height = await this.Chain.height();
    console.log('Current Block Height: ', height)

    // notify sidebar about new SDK settings
    this._notifyCurrentSDKsettings.next(this.getCurrentSDKsettings());
    console.log("Das SDK: ", this.Chain);

  
    //this.compileAndDeploy(this.code);
  }

   fromCodeToACI(code) {
    //let compilerUrl = "http://localhost:3080";
    let compilerUrl = "https://compiler.aepps.com/aci";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
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
  async compileAndDeploy(_deploymentParams: any[]) : Promise<any> {
    console.log("deploying...");

    let sourceCode = this.code
    // replace " => \"
    sourceCode = sourceCode.replace(new RegExp('"', 'g'), '\"');

    // remove comments
    sourceCode = sourceCode.replace(new RegExp('\\/\\/.*', 'g'), '');
    sourceCode = sourceCode.replace(new RegExp('\\/\\*.*[\s\S]*\\*\\/', 'g'), '');

    // code to aci
    //console.log("Hier kommt der code: ", sourceCode);
    
    // create a contract instance
    var myContract = await this.Chain.getContractInstance(this.code);
    
    // Deploy the contract
    try {
      console.log("Deployment params:", _deploymentParams)
      await myContract.methods.init.apply(null, _deploymentParams);
    } catch(e){
      console.log("Something went wrong, investigating tx!");
      console.log(e);
      //e.verifyTx();
        }

    console.log("My contract: ", myContract);
    console.log("My account: ", this.Chain.addresses());
    console.log("Das ganze SDK: ", this.Chain);

    

    this.fromCodeToACI(sourceCode)
    .subscribe(
      (data: EncodedACI) => {
      // save ACI to generate a contract instance for the editor
      let rawACI = data.encoded_aci
        
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

      // 3.  now that we have it, generate the formgroups for the function args for input validation
      let aci = this.addFormGroupsForFunctions(rawACI);
      
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
    error => console.log("oops fehler ", error.error));
    return true;
  }

  async generateACIonly(sourceCode: any) : Promise<any> {
    // replace " => \"
    sourceCode = sourceCode.replace(new RegExp('"', 'g'), '\"');

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
      this.rawACI = data.encoded_aci
        
        // now add an index to each function and sort them, just to be sure
        // 1. just to make sure the init func is on top, sort functions.
        
        this.rawACI.contract.functions.sort(
          (x, y) => { return x.name == 'init' ? -1 : y.name == 'init' ? 1 : 0 }
      )

      // 2. enumerate functions explicitly with index
      this.rawACI.contract.functions.forEach((one, i) => {

          this.rawACI.contract.functions[i].IDEindex = i;
          //console.log(one);
          //console.log(i);
      })

      // 3.  now that we have it, generate the formgroups for the function args
      this.initACI = this.addFormGroupsForFunctions(this.rawACI);
      
      //console.log("Hier init ACI object:", this.aci)
      
      this._notifyCompiledAndACI.next(0);
      //this._notifyCurrentSDKsettings.next(0);
    },
    (error) =>  {console.log("oooops fehler ", error.error) 
    this.initACI = {} as ContractBase<any>;

    // tell sidebar et al. that there is no valid contract there right now
    this._notifyCompiledAndACI.next(0);
    return true;
  } );
    
    this.initACI = {} as ContractBase<any>;

    // tell sidebar et al. that there is no valid contract there right now
    this._notifyCompiledAndACI.next(0);
    return true;
  }


 // generates a typescript-safe contract instance with a FormGroup in functions array
 addFormGroupsForFunctions(aci: any): ContractBase<any> {

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

          controlls[i] = arg.type.option != null ? new FormControl(arg.name || '')
              : new FormControl(arg.name || '', Validators.required);

          //console.log(`For ${arg.name} adding ${controlls.length} controlls`)
              // generate FormGroup from object of form controls and put the FormGroup into functions[].formGroup in ACI structure
          fun.formGroup = new FormGroup(controlls)

      })
  });

  return new ContractBase(aci);
}

/* listeners start */

   // Part 1/3 for asking currently open editor for its code
   public _fetchActiveCode = new BehaviorSubject<number>(0);
   oneEvent = this._fetchActiveCode.asObservable();
 
   // "new ACI available to generate GUI for contract deployment / init() function "
   public _notifyCompiledAndACI = new BehaviorSubject<number>(0);
   newRawACI = this._notifyCompiledAndACI.asObservable();
 
   // a new contract was deployed!
   public _notifyDeployedContract = new BehaviorSubject<any>(null);
   newContract = this._notifyDeployedContract.asObservable();
   
   // a (new) account was found!
   public _notifyCurrentSDKsettings = new BehaviorSubject<any>({});
   newAccounts = this._notifyCurrentSDKsettings.asObservable();
 
  /* listeners end */

  /* all things sharing related start */
  public activeCodeSelection : any
  /* all things sharing related end */
}


export class EncodedACI {
  encoded_aci: any;
}
