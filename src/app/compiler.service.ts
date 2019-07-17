import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'
//import { Crypto } from '@aeternity/aepp-sdk/es'
import { Contract } from './contracts/hamster';
var Ae = Universal;

@Injectable({
  providedIn: 'root'
})
export class CompilerService {

  code: Contract<string> = new Contract();
  

  constructor(private http: HttpClient) {
    console.log("Compilerservice initialized!");  

    // Use Flavor   
    var Chain = Ae({
      url: 'https://sdk-testnet.aepps.com',
      //internalUrl: 'http://localhost:3001/internal/',
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
    let compilerUrl = "http://localhost:3080/aci";
    //let compilerUrl = "https://compiler.aepps.com/aci";
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.post<EncodedACI>(compilerUrl, {"code":`${code}`, "options":{}}, httpOptions);
   }
}

export class EncodedACI {
  encoded_aci: any;
}
