import { FormGroup } from '@angular/forms';

export class ContractBase<T> {
    name: string;
    functions: any;
    state: {};
    type_defs: string[];
    address: string;

    constructor(aci: {
        contract: {
            name: string;
            functions: {
                arguments: any[];
                name: string;
                returns: any;
                stateful: boolean;
                payable?: boolean;
                IDEindex: number; // custom shit for generating the angular formControls, added by the contract-control service
                formGroup: FormGroup;
                currentInputData: any[];
                currentReturnData?: any;
            }[];
            state: {
                record: any[];
            };
            type_defs: any[];
        },

    }) {

    function setAddress(_address: string) {
        this.address = _address;
    }
        
    this.name = aci.contract.name;
    this.functions = aci.contract.functions || '';
    this.state = aci.contract.state || {};
    this.type_defs = aci.contract.type_defs || [];
    }
}