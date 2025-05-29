export class AeForUsers {
  public contractUID = '';
  public code: string;
  public showInTabs = true;
  public nameInTab = 'template';
  public shareId = '';
  public activeTab = false;
  public errorHighlights: any;
  public sharingHighlighters: any[] = [];
  public latestACI: any;

  constructor(params: Record<string, any>) {
    this.contractUID = String(Date.now() + 1);
    if (params._nameInTab != undefined) this.nameInTab = params._nameInTab;
    if (params._shareId != undefined) this.shareId = params._shareId;
    this.code =
      params._code ??
      `
        // This demostrates sending and getting Ae Tokens from contracts.
// User sends money to this contract to further send it to the receivers he wants to add up
// Then it add the receivers with the amount they can withdraw but require enough amount in the contract itself to move further
// The the receiver can withdraw it's amount.

contract AeForUsers =
    record state = {
        receiver: map(address, int),
        deployer: address,
        total_balance: int // sum of balance of every register user
      }
    stateful entrypoint init() = {
        receiver = {},
        deployer = Call.caller,
        total_balance = 0
      }

    // Let user send money to this contract
    payable stateful entrypoint send_money_to_this_contract() : bool =
       true

    // Set receiver with the maximum amount it can withdraw
    stateful entrypoint set_receiver(raddress: address, can_withdraw: int) =
       require(Call.caller == state.deployer, "Only owner can set receiver")
       // Check if contract balance exsists before adding it for user.
       if(Contract.balance >= can_withdraw)
         put(state{total_balance = state.total_balance + can_withdraw})

       if(Contract.balance >= state.total_balance)
         put(state{receiver[raddress] = can_withdraw})

       // If total balance of all users is bigger than balance available in this contract
       // then we can't add user and need to decreased total (which increased above)
       else
         put(state{total_balance = state.total_balance - can_withdraw})


    // Let user withdraw the amount they want to and subtract that from the amount they can withdraw
    stateful entrypoint withdraw(amount_to_withdraw: int) =
        if(state.receiver[Call.caller] >= amount_to_withdraw)
          put(state{receiver[Call.caller] = state.receiver[Call.caller] - amount_to_withdraw})
          put(state{total_balance = state.total_balance - amount_to_withdraw})
          Chain.spend(Call.caller, amount_to_withdraw)

    // Check User(Caller) Balance
    stateful entrypoint checkUserBalance(): int =
      state.receiver[Call.caller]

    // Check the total balance available in contract
    stateful entrypoint checkContractBalance(): int =
      Contract.balance

    stateful entrypoint getSumOfTotalBalanceOfUser(): int =
      state.total_balance

    // Withdraw leftovers
    stateful entrypoint withdrawAll() =
      if(Call.caller == state.deployer)
        Chain.spend(Call.caller, Contract.balance-state.total_balance)

`;
  }

  //experimental
  public showInTabsOrNot(): boolean {
    return this.showInTabs;
  }
}
