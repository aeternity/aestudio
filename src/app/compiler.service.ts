import { Injectable,Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'
import { BehaviorSubject } from 'rxjs';
//import { Crypto } from '@aeternity/aepp-sdk/es'
import { Contract } from './contracts/hamster';
import { ContractBase } from './question/contract-base'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContractACI } from '@aeternity/aepp-sdk/es/contract/aci'

var Ae = Universal;

@Injectable({
  providedIn: 'root'
})
export class CompilerService {

  // setting default code, later pulled from editor
  code: string = new Contract().code;

  // the code from the currently active compiler window
  aci: ContractBase<any>;

  // aci only for the init function
  initACI: ContractBase<any>;

  // not used yet, just for tabs later: same as ACI, but contains address of deployed contract
  activeContracts: ContractBase<any>[];

  // only ACI, from the code of the currently opened tab
  rawACI: any;

  // the SDK initialization
  Chain: any;
 

/* listeners start */

   // Part 1/3 for asking currently open editor for its code
  public _fetchActiveCode = new BehaviorSubject<number>(0);
  oneEvent = this._fetchActiveCode.asObservable();

  // "new ACI available to generate GUI for contract deployment / init() function "
  public _notifyCompiledAndACI = new BehaviorSubject<number>(0);
  newRawACI = this._notifyCompiledAndACI.asObservable();

  // a new contract was deployed!
  public _notifyDeployedContract = new BehaviorSubject<number>(0);
  newContract = this._notifyDeployedContract.asObservable();

 /* listeners end */

  
  // Part 2/3 of asking active tab's editor for code - this needs to be triggered by tab component !
 // ask the components to send code
  public makeCompilerAskForCode(number){
    console.log("im compiler angekommen");
    this._fetchActiveCode.next(number);
  }

  constructor(private http: HttpClient) {
    this.setupClient();
    console.log("Compilerservice initialized!");  
   }

  async setupClient(){

    // Use Flavor   
    this.Chain = await Ae({
      url: 'https://sdk-testnet.aepps.com',
      //internalUrl: 'http://localhost:3001/internal/',
      //compilerUrl: 'http://localhost:3080',
      compilerUrl: 'https://compiler.aepps.com',
      nativeMode: true,
      keypair: { 
        secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca', 
        publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU' }
        //,
      //networkId: 'ae_devnet' // or any other networkId your client should connect to
    }).catch(e => { console.log("Shit, it didn't work:", e)})

    // todo: wrap in try catch
    let height = await this.Chain.height();
    console.log('Current Block Height: ', height)

    //console.log(this.code);

    //this.compileAndDeploy(this.code);
  }

  async deployActiveContract(){
    // create a contract instance
    //var myContract = await this.Chain.getContractInstance(this.code);
    
   /*  try {
      await myContract.deploy([])
    } catch(e){
      console.log("Something went wrong, investigating tx!");
      e.verifyTx();
    } */

    //console.log(myContract);

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


  // converts code to ACI and deploys.
  async compileAndDeploy() : Promise<any> {
    console.log("deploying...");
    
    let sourceCode = this.code
    // replace " => \"
    sourceCode = sourceCode.replace(new RegExp('"', 'g'), '\"');

    // remove comments
    sourceCode = sourceCode.replace(new RegExp('\\/\\/.*', 'g'), '');
    sourceCode = sourceCode.replace(new RegExp('\\/\\*.*[\s\S]*\\*\\/', 'g'), '');

    // code to aci
    console.log("Hier kommt der code: ", sourceCode);
    
    // create a contract instance
    var myContract = await this.Chain.getContractInstance(this.code);
    
    // Deploy the contract
    try {
      await myContract.deploy([])
    } catch(e){
      console.log("Something went wrong, investigating tx!");
      e.verifyTx();
    }

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
      this.aci = this.addFormGroupsForFunctions(this.rawACI);
      
      console.log("Hier final contract object:", this.aci)
      console.log(this.aci);
    },
    error => console.log(error.error));
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
      
      console.log("Hier init ACI object:", this.aci)
      
      this._notifyCompiledAndACI.next(0);
    },
    error => console.log(error.error));
    this.initACI = {} as ContractBase<any>;

    // tell sidebar et al. that there is no valid contract there right now
    this._notifyCompiledAndACI.next(0);
    return true;
  }


 // generates a typescript-safe contract instance with a FormGroup in functions array
 addFormGroupsForFunctions(aci: any): ContractBase<any> {

  // 1. create several formgroups: one FG for each fun, return final contract
  console.log("ACI hier:", aci);
  let functions = aci.contract.functions;

  // 2. ... for every function of the contract....
  functions.forEach(fun => {
      //onsole.log("Taking care of ", fun.name);

      // 2.5 ...generate a formgroup checking all the params, make the "options" types non-required 
      fun.arguments.forEach((arg, i, allArgs) => {
          let controlls: any = [];
          
          /* // temp testing: 
          arg.type.option != null ? console.log("OPTION FOUND! ",arg) : true;
*/
          
          controlls[i] = arg.type.option != null ? new FormControl(arg.name || '')
              : new FormControl(arg.name || '', Validators.required);

          //console.log(`For ${arg.name} adding ${controlls.length} controlls`)
              // generate FormGroup from object of form controls and put the FormGroup into functions[].formGroup in ACI structure
          fun.formGroup = new FormGroup(controlls)

      })
  });

  return new ContractBase(aci);
}

}


export class EncodedACI {
  encoded_aci: any;
}
