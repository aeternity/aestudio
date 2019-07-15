export class QuestionBase<T> {
    value: T;
    key: string;
    label: string;
    required; boolean;
    order; number;
    controlType;

    constructor(options: {
        value?: T,
        key?: string,
        label?: string,
        required?: boolean,
        order?: number,
        controlType?: string
    } = {}) {
        
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = options.required || '';
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    
    }
}

[
    {
        "contract": {
            "functions": [
                {
                    "arguments": [],
                    "name": "init",
                    "returns": "CryptoHamster.state",
                    "stateful": true
                },
                {
                    "arguments": [
                        {
                            "name": "hamster_name",
                            "type": "string"
                        }
                    ],
                    "name": "create_hamster",
                    "returns": {
                        "tuple": []
                    },
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
]