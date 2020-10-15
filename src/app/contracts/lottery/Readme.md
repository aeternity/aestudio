# Tutorial: Online Lottery Contract
## Tutorial OverView
This tutorial is meant as an example for those who want to get started developing Smart Contracts with the Sophia Programming Language.\
In this tutorial, we will build an Online Lottery Smart Contract. The contract will have the following features:
- Specify the number of Contestants.
- Each contestant can wager on a number and can only wager once.
- Specify the least amount a Contestant can wager on a number.
- Specify the highest number that can be wagered on.
- Specify the total number of Contestants for the contract.
- The winning number is decided by a Random number generator.
- If only one contestant's number is equal to the winning number, that contestant takes all the tokens added to the contract including his own.
- If there are more than one winner, each of the winner's added token is divided by the total number of tokens added to the contract by the winners, then multiplied by the total number of tokens added by all users to the Contract.
- if there are no winners, all the tokens added by the contestants are sent to the address of the person who deployed the Contract.

For this Contract, we will use the List library, so we will start by including it in our contract as well as defining our Contract name and our Contract state values:
```sophia
include "List.aes"
contract Lottery=

    record contestant={
        user:address,
        number:int,
        value:int}

    record state= {
        winning_number:int,
        max_winning_number:int,
        total_num_of_contestants:int,
        minimum_wager:int,
        num_of_wagers:int,
        total_wager:int,
        contestants_list:list(contestant),
        deployer_address:address,
        total_winners_wage:int,
        winners:int,
        valueToSend:int}


    stateful entrypoint init ()={
        winning_number=5,
        minimum_wager=1000000000000000000,
        total_wager=0,
        total_num_of_contestants=2,
        max_winning_number=10,
        contestants_list=[],
        num_of_wagers=0,
        deployer_address=Call.caller,
        total_winners_wage=0,
        winners=0,
        valueToSend=0
        }
```
So above, there is a contestant record that contains the details of each contestant, it contains the address, the number wagered on by a contestant and the amount he has decided to wager on that number. \
Also, we have some other interesting variables in our state.\

winning_number: it is the value of the winning number that determines which contestant wins the Lottery.\
max_winning_number:It is a number that specifies the highest number a contestant can wager on.\
total_num_of_contestant: It is a number that determines the total number of expected contestants.\
num_of_wagers:It specifies the present number of contestants in the contract, the moment this number is equal to the  `total_num_of_contestant`, the winners are automatically announced.\
total_wager: The total amount of tokens added by the contestants in the contract.\
contestants_list: The list of the contestants record created earlier.\
deployer_address: The address of the person who deployed the contract.\
total_winners_wage:The total amount that the winners put in the contract.\
winners: The total number of winners.\
We then give our state its initial value in our init function.Lets proceed by creating a function that allows us to make a wager, we'll call it bet

```sophia
   payable stateful entrypoint bet(number':int)=
        if(check_if_contestant_exist())
            abort("You cant contest twice")
        require(number'>=0 && number'<state.max_winning_number,"Your number must be less than the winning number")
        require(Call.value>=state.minimum_wager,"Your wager must not be less than the minimum wager")
        let new_total_wager=Call.value+state.total_wager
        let present_contestant:contestant={number=number',user=Call.caller,value=Call.value}
        let new_list_of_contestants= present_contestant::state.contestants_list
        let new_num_of_wagers=state.num_of_wagers+1
        put(state{contestants_list=new_list_of_contestants,num_of_wagers=new_num_of_wagers,total_wager=new_total_wager})
        if(new_num_of_wagers>=state.total_num_of_contestants)
            announce_winners()

```
 The bet function receives a number which is the value the user wants to wager on, the first thing it does is to call a function `check_if_contestant_exist` and aborts if a contestant exists, you can see the function `check_if_contestant_exist` below:
 
 ```sophia
    function check_if_contestant_exist():bool=
        switch(List.find((a)=>a.user==Call.caller,state.contestants_list))
            None=>false
            Some(x)=>true
    
 ```
The `bet` function then goes on to check if the number entered by the user is greater than or equal to zero and less than the maximum winning number(`state.max_winning_number`). After this, it adds the contestant to our state's `contestants_list`, and also increments our state's `num_of_wagers`.The function then proceeds to  check if the total number of contestants is now equal to the maximum number of wagers and calls a function `announce_winners` which you can find below:

```sophia
       stateful function announce_winners()=
        let total_winners_wager=0
        let winning_number=Chain.block_height mod state.max_winning_number
        let list_of_winners=List.filter((contestant)=>contestant.number==winning_number,state.contestants_list)
        let number_of_winners=List.length(list_of_winners)
        if(number_of_winners==0)
            transfer_money_to_contract_deployed_address()
        else           
            List.foreach(list_of_winners,record_total_winners_wager)
            List.foreach(list_of_winners,transfer_money_to_winner)
        put(state{winners=number_of_winners,winning_number=winning_number})
```

The `announce_winners` function calculates the total winners wage, and also calculates the winning number, then uses a filter operation on the total number of contestant's list(`state.contestants_list`) to get the list of winners by checking if the `number` field of each contestant record is equal to the winning number(`state.winning_number`).
so we proceed by checking if the list of winners length is equal to zero meaning there was no winner, and then call a method `transfer_money_to_contract_deployed_address` which you can find below:

```sophia
    stateful payable function transfer_money_to_contract_deployed_address()=
        Chain.spend(state.deployer_address,state.total_wager)
```
The function simply sends the total tokens sent to the contract to the address that deployed the contract.

In a case where the the list of winners length is not equal to zero we loop through the list of winners(`list_of_winners`) and then call a method for each contestant called `record_total_winners_wager`, you can find the function below:

```sophia
    stateful function record_total_winners_wager(contestant'):unit=
        let new_total_winers_wager=contestant'.value+state.total_winners_wage
        put(state{total_winners_wage=new_total_winers_wager})

```
the `record_total_winners_wager` simply increments our state's `total_winners_wage` by each contestant's wager.

After this, the `announce_winners` function proceeds with the last step which is to send the tokens to each contestant in our list of winners(`list_of_winners`) by calling a function called `transfer_money_to_winner` which you can find below:

```sophia
  stateful payable function transfer_money_to_winner(contestant':contestant)=
        let valueToSend'=(contestant'.value*state.total_wager)/state.total_winners_wage
        Chain.spend(contestant'.user,valueToSend')
        put(state{valueToSend=valueToSend'})
```
the `transfer_money_to_winner` function simply calculates each winner's reward by multiplying each contestant's added token by the total tokens added by all users and dividing it by the total tokens added by the winners and sends it to them using the `Chain.spend function`.
That brings us to the end of the tutorial\

# Full Code
```sophia
include "List.aes"
contract Lottery=

    record contestant={
        user:address,
        number:int,
        value:int}

    record state= {
        winning_number:int,
        max_winning_number:int,
        total_num_of_contestants:int,
        minimum_wager:int,
        num_of_wagers:int,
        total_wager:int,
        contestants_list:list(contestant),
        deployer_address:address,
        total_winners_wage:int,
        winners:int,
        valueToSend:int}


    stateful entrypoint init ()={
        winning_number=5,
        minimum_wager=1000000000000000000,
        total_wager=0,
        total_num_of_contestants=2,
        max_winning_number=10,
        contestants_list=[],
        num_of_wagers=0,
        deployer_address=Call.caller,
        total_winners_wage=0,
        winners=0,
        valueToSend=0
        }

    payable stateful entrypoint bet(number':int)=
        if(check_if_contestant_exist())
            abort("You cant contest twice")
        require(number'>=0 && number'<state.max_winning_number,"Your number must be less than the winning number")
        require(Call.value>=state.minimum_wager,"Your wager must not be less than the minimum wager")
        let new_total_wager=Call.value+state.total_wager
        let present_contestant:contestant={number=number',user=Call.caller,value=Call.value}
        let new_list_of_contestants= present_contestant::state.contestants_list
        let new_num_of_wagers=state.num_of_wagers+1
        put(state{contestants_list=new_list_of_contestants,num_of_wagers=new_num_of_wagers,total_wager=new_total_wager})
        if(new_num_of_wagers>=state.total_num_of_contestants)
            announce_winners()

    function check_if_contestant_exist():bool=
        switch(List.find((a)=>a.user==Call.caller,state.contestants_list))
            None=>false
            Some(x)=>true


    stateful function announce_winners()=
        let total_winners_wager=0
        let winning_number=Chain.block_height mod state.max_winning_number
        let list_of_winners=List.filter((contestant)=>contestant.number==winning_number,state.contestants_list)
        let number_of_winners=List.length(list_of_winners)
        if(number_of_winners==0)
            transfer_money_to_contract_deployed_address()
        else           
            List.foreach(list_of_winners,record_total_winners_wager)
            List.foreach(list_of_winners,transfer_money_to_winner)
        put(state{winners=number_of_winners,winning_number=winning_number}) 

    stateful payable function transfer_money_to_contract_deployed_address()=
        Chain.spend(state.deployer_address,state.total_wager)   

    stateful function record_total_winners_wager(contestant'):unit=
        let new_total_winers_wager=contestant'.value+state.total_winners_wage
        put(state{total_winners_wage=new_total_winers_wager})

    stateful payable function transfer_money_to_winner(contestant':contestant)=
        let valueToSend'=(contestant'.value*state.total_wager)/state.total_winners_wage
        Chain.spend(contestant'.user,valueToSend')
        put(state{valueToSend=valueToSend'})
```