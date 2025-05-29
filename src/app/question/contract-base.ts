export class ContractBase {
  name: string;
  functions: any;
  state: object;
  type_defs?: string[];
  address: string;

  constructor(aci: {
    contract: {
      name: string;
      functions: {
        arguments: [
          {
            name: string;
            type: any;
            currentInput: any;
            IDEindex: number;
          },
        ];
        name: string;
        returns: any;
        stateful: boolean;
        payable?: boolean;
        lastReturnData?: any;
        loading: boolean;
        IDEindex: number; // custom shit for generating the angular formControls, added by the contract-control service
        // formGroup: FormGroup;
      }[];
      state: {
        record: any[];
      };
      typedefs: any[];
    };
  }) {
    this.name = aci.contract.name;
    this.functions = aci.contract.functions || [];
    this.state = aci.contract.state || {};
    this.type_defs = aci.contract.typedefs || [];
  }
}
