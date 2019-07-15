import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContractBase } from 'src/app/question/contract-base';
import { DropdownQuestion } from "src/app/question/question-dropdown";
import { TextboxQuestion } from "src/app/question/question-textbox";

@Injectable({
  providedIn: 'root'
})
export class ContractControlService {

  contract: ContractBase<any>;

  constructor() {

    //this.contract= this.parseACI();
    this.parseACI();
    //console.log("Name: ", this.contract.name);
    //console.log("Functions: ", this.contract.functions);
  }

  parseACI() { // flatten the damn ACI
    
    // 1. put the raw ACI here
    var rawACI: any = {
      "contract": {
        "functions": [
            {
                "arguments": [
                    {
                        "name": "hamster_name",
                        "type": {
                            "option": [
                                "string"
                            ]
                        }
                    }
                ],
                "name": "create_hamster",
                "returns": "bool",
                "stateful": true
            },
            {
                "arguments": [],
                "name": "init",
                "returns": "CryptoHamster.state",
                "stateful": true
            },
            {
                "arguments": [
                    {
                        "name": "name",
                        "type": "string"
                    }
                ],
                "name": "name_exists",
                "returns": "bool",
                "stateful": false
            },
            {
                "arguments": [
                    {
                        "name": "name",
                        "type": "string"
                    }
                ],
                "name": "get_hamster_dna",
                "returns": "int",
                "stateful": false
            },
            {
                "arguments": [
                    {
                        "name": "name",
                        "type": "string"
                    }
                ],
                "name": "test",
                "returns": {
                    "bytes": 32
                },
                "stateful": false
            }
        ],
        "name": "CryptoHamster",
        "state": {
            "record": [
                {
                    "name": "index",
                    "type": "int"
                },
                {
                    "name": "map_hamsters",
                    "type": {
                        "map": [
                            "string",
                            "CryptoHamster.hamster"
                        ]
                    }
                }
            ]
        },
        "type_defs": [
            {
                "name": "hamster",
                "typedef": {
                    "record": [
                        {
                            "name": "id",
                            "type": "int"
                        },
                        {
                            "name": "name",
                            "type": "string"
                        },
                        {
                            "name": "dna",
                            "type": "int"
                        }
                    ]
                },
                "vars": []
            }
        ]
    }
  }

    // 1.5 sort init function to ACI functions' index 0
    
    // 1.6 pop the init func from functions array
    
    // NO, try with sort !!
    rawACI.contract.functions.sort(
        (x,y) => { return x.name == 'init' ? -1 : y.name == 'init' ? 1 : 0 }
    )

    /* var shifted: boolean = false;
    rawACI.contract.functions.forEach((one,i) => { 
        if (!shifted) {
            one.name == 'init' ? rawACI.contract.functions.unshift(one) : true;
            shifted = true;
        }
    }) */

    // 1.7 add the init func to array later

    // 2. enumerate functions explicitly with index
    rawACI.contract.functions.forEach((one,i) => { 
      
      rawACI.contract.functions[i].IDEindex = i;
      console.log(one);
      console.log(i);
    })


    // 3. generate contract from formatted aci

    this.contract = this.toContract(rawACI);
    console.log(this.contract);
   
  }

    // generates a typescript-safe contract instance with a FormGroup in functions array
   toContract(aci: any) : ContractBase<any> {
    
    // 1. create several formgroups: one FG for each fun, return final contract
    let functions = aci.contract.functions;

    // 2. ... for every function of the contract....
    functions.forEach(fun => {

        // 2.5 ...generate a formgroup checking all the params, make the "options" types non-required 
      fun.arguments.forEach((arg, i, allArgs) => {
        let controlls: any = {};
        controlls[i] = 'option' in arg ? new FormControl(arg.name || '' )
                                      : new FormControl(arg.name || '', Validators.required );
        // generate FormGroup from object of form controls and put the FormGroup into functions[].formGroup in ACI structure
        fun.formGroup = new FormGroup(controlls)

      })

     /*  oneGroup[fun.IDEindex] = question.required ? new FormControl(question.value || '', Validators.required)
                                              : new FormControl(question.value || '' );
      formGroups.push(new FormGroup(oneGroup)); */
    });

    return new ContractBase(aci);
  }  
}
