import { Injectable,Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'
import { BehaviorSubject } from 'rxjs';
//import { Crypto } from '@aeternity/aepp-sdk/es'
import { Contract } from './contracts/hamster';
import { ContractBase } from './question/contract-base'

var Ae = Universal;

@Injectable({
  providedIn: 'root'
})
export class CompilerService {

  code: string = new Contract().code;
  aci: ContractBase<any>;
  
 

   // Part 1/3 for asking currently open editor for its code
  public _fetchActiveCode = new BehaviorSubject<number>(0);
  oneEvent = this._fetchActiveCode.asObservable();

  
  // Part 2/3 of asking active tab's editor for code - this needs to be triggered by tab component !
 // ask the components to send code
  public makeCompilerAskForCode(number){
    console.log("im compiler angekommen");
    this._fetchActiveCode.next(number);
  }

  constructor(private http: HttpClient) {
    console.log("Compilerservice initialized!");  

    // Use Flavor   
    var Chain = Ae({
      url: 'https://sdk-testnet.aepps.com',
      //internalUrl: 'http://localhost:3001/internal/',
      //compilerUrl: 'http://localhost:3080',
      compilerUrl: 'https://compiler.aepps.com',
      nativeMode: true,
      keypair: { 
        secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca', 
        publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU' },
      networkId: 'ae_devnet' // or any other networkId your client should connect to
    }).then(ae => {
      // Interacting with the blockchain client
      // getting the latest block height
      ae.height().then(height => {
        // logs current height
        console.log('Current Block Height:', height)
      }).catch(e => {
        // logs error
        console.log(e)
      })
    }).catch(e => { console.log("Shit, it didn't work:", e)})

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


  // Part 2/3 of asking active tab's editor for code - this needs to be triggered by tab component !
  /* askEditorsForCode(){
    console.log("Im compiler kam an.");
    //this.fetchActiveCode.emit();
    this._fetchActiveCode.emit();
  } */

  // currently just converts code to ACI
  compile(sourceCode: any) : any {
    // replace " => \"
    sourceCode = sourceCode.replace(new RegExp('"', 'g'), '\"');

    // remove comments
    sourceCode = sourceCode.replace(new RegExp('\\/\\/.*', 'g'), '');
    sourceCode = sourceCode.replace(new RegExp('\\/\\*.*[\s\S]*\\*\\/', 'g'), '');

    // code to aci
    //console.log("Hier kommt der code: ", sourceCode);
    
    this.fromCodeToACI(sourceCode)
    .subscribe(
      (data: EncodedACI) => {
      // save ACI to generate a contract instance for the editor
      this.aci = data.encoded_aci
      console.log(this.aci);
    },
    error => console.log(error.error));
    return true;
  }
}

export class EncodedACI {
  encoded_aci: any;
}
