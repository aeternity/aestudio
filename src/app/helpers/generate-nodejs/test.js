const { Universal: Ae, MemoryAccount, Node } = require('@aeternity/aepp-sdk')

      // GLOBALS START 
      
      // account that will be used for the transactions
      const acc1 = MemoryAccount({ keypair: { secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca', publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU' } });
      
      // a reference to the aeternity blockchain
      var Chain;
      
      // a reference to your contract
      var myContract;
      
      // the name of the function you want to call
      var yourFunction = "add_test_value";
      
      // the parameters of your function
      yourParams = [2,3];
      
      // the code of your contract - watch out for correct indentations !
      var code = 
      `
contract CryptoHamster =

    record state = {
        index : int, 
        map_hamsters : map(string, hamster), 
        testvalue: int}

    record hamster = {
        id : int,
        name : string,
        dna : int}

    stateful entrypoint init() = 
        { index = 1,
            map_hamsters = {},
            testvalue = 42}
    
    public entrypoint read_test_value() : int =
        state.testvalue
    
    public entrypoint return_caller() : address =
        Call.caller

    public entrypoint cause_error() : unit =
        require(2 == 1, "require failed") // comment

    public stateful entrypoint add_test_value(one: int, two: int) : int =
        put(state{testvalue = one + two})
        one + two
    
    public entrypoint locally_add_two(one: int, two: int) : int =
        one + two
    
    public stateful entrypoint statefully_add_two(one: int, two: int) =
        put(state{testvalue = one + two})
    
    stateful entrypoint create_hamster(hamster_name: string) =
        require(!name_exists(hamster_name), "Name is already taken")
        let dna : int = generate_random_dna(hamster_name)
        create_hamster_by_name_dna(hamster_name, dna)

    entrypoint name_exists(name: string) : bool =
        Map.member(name, state.map_hamsters)

    entrypoint get_hamster_dna(name: string, test: option(int)) : int =
        require(name_exists(name), "There is no hamster with that name!")

        let needed_hamster : hamster = state.map_hamsters[name]

        needed_hamster.dna

    private stateful function create_hamster_by_name_dna(name: string, dna: int) =
        let new_hamster : hamster = {
            id = state.index,
            name = name,
            dna = dna}

        put(state{map_hamsters[name] = new_hamster})
        put(state{index = (state.index + 1)})

    private function generate_random_dna(name: string) : int =
        get_block_hash_bytes_as_int() - Chain.timestamp + state.index

    private function get_block_hash_bytes_as_int() : int =
        switch(Chain.block_hash(Chain.block_height - 1))
            None => abort("blockhash not found")
            Some(bytes) => Bytes.to_int(bytes)

    entrypoint test(name: string) : hash =
        String.sha3(name)`
      
      // GLOBALS END
      
      // instantiate a connection to the aeternity blockchain
      const main = async () => {
        const node1 = await Node({ url: 'https://sdk-testnet.aepps.com', internalUrl: 'https://sdk-testnet.aepps.com' })
        // const node2 = ...
      
          Chain = await Ae({
           // This two params deprecated and will be remove in next major release
            url: 'https://sdk-testnet.aepps.com',
            internalUrl: 'https://sdk-testnet.aepps.com',
            verify: true,
            // instead use
            nodes: [
              { name: 'someNode', instance: node1 },
              // mode2
            ],
            compilerUrl: 'https://latest.compiler.aepps.com',
            // `keypair` param deprecated and will be removed in next major release
            
            accounts: [
              acc1,
              // acc2
            ],
            address: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU'
            //"th_2YL9DU4ZnKwhRx6AkDf8fgch7HMiU6vpjJWfkeBWWz3pedG2pC"
        })
        const height = await Chain.height()
        console.log('Connected to Testned Node! Current Block:', height)
      
        // deploy the contract
        await deployContract()
      
        // call your function
        console.log("Calling your function " + yourFunction);
        let callresult = await myContract.methods[yourFunction](...yourParams);
        console.log("Transaction ID: ", callresult.hash);
        console.log("Function call returned: ", callresult.decodedResult);
        
      }
      
      // call main
      main()
      
      deployContract = async () => {    
              let sourceCode = code
              // replace " => \"
              sourceCode = sourceCode.replace(new RegExp('"', 'g'), '\"');
          
              // remove comments
              sourceCode = sourceCode.replace(new RegExp('\\/\\/.*', 'g'), '');
              sourceCode = sourceCode.replace(new RegExp('\\/\\*.*[\s\S]*\\*\\/', 'g'), '');
          
              // create a contract instance
              myContract = await Chain.getContractInstance(sourceCode);
          
              // Deploy the contract
              try {
                console.log("Deploying contract....")
                console.log("Using account for deployment: ", Chain.addresses());
                await myContract.methods.init();
              } catch(e){
                console.log("Something went wrong, investigating tx!");
                console.log(e);
                console.log(" Deployment failed: " + e, "error",  myContract.aci.name)
                  }
              console.log("Contract deployed successfully!")
              console.log("Contract address: ", myContract.deployInfo.address)
              console.log("Transaction ID: ", myContract.deployInfo.transaction)
              console.log("\n \n")
      
              return true;
            }