import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable, Input, EventEmitter, Output } from '@angular/core';

// vorlage für nodeJS: https://github.com/aeternity/aepp-sdk-js/blob/develop/docs/guides/import-nodejs.md#nodejs-bundle
@Injectable({
  providedIn: 'root'
})

export class CodeFactoryService {

  constructor() {}
  
@Input()
  public _generateCode = new BehaviorSubject<any>({});
  _codeGenerator = this._generateCode.asObservable();
  public activeContracts: any[] = [];
  public test: string;
  
@Output() codeGeneratorEvent = new EventEmitter<string>()
  generateCode(_theContractCode: string, _theFunctionName: string, _theParams: any,/*  _initParams: any */){
    console.log("Generate in sidebar getriggert");
    console.log("Als parameter wurden übergeben:");
    console.log("_thefunctionName: " , _theFunctionName);
    console.log("the params: ", _theParams);
    //console.log("contract code is: ", this.activeContracts[0].source);
    let arrayOfInputData : any = [];
    _theParams.arguments.forEach(oneArg=> {
      //console.log("One input is: ", oneArg)
      
      arrayOfInputData.push(oneArg.currentInputData);
    });
      _theParams = arrayOfInputData;
    console.log("final array of input data: ", arrayOfInputData);

    // fill all code parts separately
    var generatedCodeObject = {
      SDKsetup: '',
      contractDeployment: '',
      functionCall:''
    }

    generatedCodeObject.SDKsetup = 
    `// SDK & Node setup
    const { Universal: Ae, MemoryAccount, Node } = require('@aeternity/aepp-sdk')

    const yourPrivateKey = 'Your private key'
    const yourPublicKey = 'Your public key'

    // account that will be used for the transactions
    const acc1 = MemoryAccount({ keypair: { secretKey: yourPrivateKey, publicKey: yourPublicKey } });
    
    // a reference to the aeternity blockchain
    var Chain;
    
    // instantiate a connection to the aeternity blockchain
    const main = async () => {
      const node1 = await Node({ url: 'https://sdk-testnet.aepps.com', internalUrl: 'https://sdk-testnet.aepps.com' })
      // const node2 = ...
    
        Chain = await Ae({
         // This two params deprecated and will be remove in next major release
          url: 'https://sdk-testnet.aepps.com',
          internalUrl: 'https://sdk-testnet.aepps.com',
          // instead use
          nodes: [
            { name: 'someNode', instance: node1 },
            // mode2
          ],
          compilerUrl: 'https://latest.compiler.aepps.com',
          // \`keypair\` param deprecated and will be removed in next major release
          
          accounts: [
            acc1,
            // acc2
          ],
          address: yourPublicKey

        })
        const height = await Chain.height()
        console.log('Connected to Testnet Node! Current Block:', height)
    `
       //the above missing closing curly brace is added b the editor component based on the condition
       //what generated code components are to be displayed.
    generatedCodeObject.contractDeployment = `
    // CONTRACT DEPLOYMENT

    // a reference to your contract
    var myContract;

    // the code of your contract - watch out for correct indentations !
    var code = 
    \`${_theContractCode}\`

    // create a contract instance
    myContract = await Chain.getContractInstance(code);

    // Deploy the contract
    try {
      console.log("Deploying contract....")
      console.log("Using account for deployment: ", Chain.addresses());
      await myContract.methods.init();
    } catch(e){
      console.log("Something went wrong, did you set up the SDK properly?");
      console.log("Deployment failed: ", e)
    }
      console.log("Contract deployed successfully!")
      console.log("Contract address: ", myContract.deployInfo.address)
      console.log("Transaction ID: ", myContract.deployInfo.transaction)
      console.log("\\n \\n")  `

    generatedCodeObject.functionCall = `

    // CONTRACT FUNCTION CALL

    // the name of the function you want to call
    var yourFunction = \"${_theFunctionName}\";
    
    // the parameters of your function
    yourParams = [${_theParams}];

    // call your function
    console.log("Calling your function: " + yourFunction);
    try{
      let callresult = await myContract.methods[yourFunction](...yourParams);
      console.log("Transaction ID: ", callresult.hash);
      console.log("Advice: log the full callResult object for more useful information!")
      console.log("Function call returned: ", callresult.decodedResult);
    } catch (e){
      console.log("Calling your function errored: ", e)
    }`
    this._generateCode.next(generatedCodeObject);
    }

    generateFinalFormattedCode = (codeObject, codeGeneratorSettings) => {

      let cgs = codeGeneratorSettings;

      let finalCode = 
      `${cgs.sdk ? codeObject.SDKsetup : ''}
      ${cgs.contract ? codeObject.contractDeployment : ''}
      ${!cgs.sdk && !cgs.contract && cgs.function? "// don't forget to change the 'myContract' placeholder to yours " : ''}
      ${cgs.function ? codeObject.functionCall : ''}
      ${cgs.sdk ? '} \n main();' : ''}
      `
      return finalCode
    }

  }






