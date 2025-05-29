import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ContractBase } from 'src/app/question/contract-base';

@Injectable({
  providedIn: 'root',
})
export class ContractControlService {
  contractForm: ContractBase;

  rawACI: any = {
    contract: {
      functions: [
        {
          arguments: [
            {
              name: 'hamster_name',
              type: {
                option: ['string'],
              },
            },
          ],
          name: 'create_hamster',
          returns: 'bool',
          stateful: true,
        },
        {
          arguments: [],
          name: 'init',
          returns: 'CryptoHamster.state',
          stateful: true,
        },
        {
          arguments: [
            {
              name: 'name',
              type: 'string',
            },
          ],
          name: 'name_exists',
          returns: 'bool',
          stateful: false,
        },
        {
          arguments: [
            {
              name: 'name',
              type: 'string',
            },
          ],
          name: 'get_hamster_dna',
          returns: 'int',
          stateful: false,
        },
        {
          arguments: [
            {
              name: 'name',
              type: 'string',
            },
          ],
          name: 'test',
          returns: {
            bytes: 32,
          },
          stateful: false,
        },
      ],
      name: 'CryptoHamster',
      state: {
        record: [
          {
            name: 'index',
            type: 'int',
          },
          {
            name: 'map_hamsters',
            type: {
              map: ['string', 'CryptoHamster.hamster'],
            },
          },
        ],
      },
      type_defs: [
        {
          name: 'hamster',
          typedef: {
            record: [
              {
                name: 'id',
                type: 'int',
              },
              {
                name: 'name',
                type: 'string',
              },
              {
                name: 'dna',
                type: 'int',
              },
            ],
          },
          vars: [],
        },
      ],
    },
  };

  parseACItoForm() {
    // flatten the damn ACI

    // 1. just to make sure the init func is on top, sort functions.
    this.rawACI.contract.functions.sort((x, y) => {
      return x.name == 'init' ? -1 : y.name == 'init' ? 1 : 0;
    });

    // 2. enumerate functions explicitly with index
    this.rawACI.contract.functions.forEach((one, i) => {
      this.rawACI.contract.functions[i].IDEindex = i;
      console.log(one);
      console.log(i);
    });

    // 3. generate contract from formatted aci
    this.contractForm = this.toContract(this.rawACI);
    console.log(this.contractForm);
  }

  // generates a typescript-safe contract instance with a FormGroup in functions array
  toContract(aci: any): ContractBase {
    // 1. create several formgroups: one FG for each fun, return final contract
    const functions = aci.contract.functions;

    // 2. ... for every function of the contract....
    functions.forEach((fun) => {
      //console.log("Taking care of", fun.name);

      // 2.5 ...generate a formgroup checking all the params, make the "options" types non-required
      fun.arguments.forEach((arg, i) => {
        const controlls: any = [];

        /* // temp testing:
                arg.type.option != null ? console.log("OPTION FOUND!",arg) : true;
 */

        controlls[i] =
          arg.type.option != null
            ? new UntypedFormControl(arg.name || '')
            : new UntypedFormControl(arg.name || '', Validators.required);

        //console.log(`For ${arg.name} adding ${controlls.length} controlls`)
        // generate FormGroup from object of form controls and put the FormGroup into functions[].formGroup in ACI structure
        fun.formGroup = new UntypedFormGroup(controlls);
      });
    });

    return new ContractBase(aci);
  }

  // recieve generated ACI from compiler service

  // Todo: also have contract code passed here, for the SDK and everything
  takeACI(aci) {
    this.rawACI = aci;
    this.parseACItoForm();
  }
}

/* Use this later for checking if somewhere in the args a type is set to "optional:"

if( JSON.stringify(object_name).indexOf("key_name") > -1 ) {
    console.log("Key Found");
}
else{
    console.log("Key not Found");
} */
