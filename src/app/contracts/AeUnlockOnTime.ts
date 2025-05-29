export class AeUnlockOnTime {
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
    this.contractUID = String(Date.now() + 2);
    if (params._nameInTab != undefined) this.nameInTab = params._nameInTab;
    if (params._shareId != undefined) this.shareId = params._shareId;
    this.code =
      params._code ??
      `
        // This demostrates sending and getting Ae Tokens from contracts and Only when they available to withdraw.
// User sends money to this contract to further send it to the receivers he wants to add up with the time from when make withdraw available
// Then it add the receivers with the amount they can withdraw but require enough amount in the contract itself to move further and also 2 mins from now lock on funds
// The the receiver can withdraw it's amount once the amount is unlocked (Current block timestamp exceeds the time to lock the amount).
// The time to lock funds is 2 mins from the the time of registeration of new user.

contract AeUnlockOnTime =
    record state = {
        receiver: map(address, user_balance),
        deployer: address,
        total_balance: int // sum of balance of every register user
      }

    record user_balance = {
        balance: int,
        available_from: int
      }
    stateful entrypoint init() = {
        receiver = {},
        deployer = Call.caller,
        total_balance = 0
      }


    function unlockFromNowIn(): int =
        Chain.timestamp + (1000*120) // Current time + 120 seconds

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
         put(state{receiver[raddress] = {balance = can_withdraw, available_from = unlockFromNowIn()}})

       // If total balance of all users is bigger than balance available in this contract
       // then we can't add user and need to decreased total (which increased above)
       else
         put(state{total_balance = state.total_balance - can_withdraw})


    // Let user withdraw the amount they want to and subtract that from the amount they can withdraw
    stateful entrypoint withdraw(amount_to_withdraw: int) =
        if(state.receiver[Call.caller].balance >= amount_to_withdraw && state.receiver[Call.caller].available_from < Chain.timestamp)
          put(state{receiver[Call.caller] = {balance = state.receiver[Call.caller].balance - amount_to_withdraw, available_from = state.receiver[Call.caller].available_from}})
          put(state{total_balance = state.total_balance - amount_to_withdraw})
          Chain.spend(Call.caller, amount_to_withdraw)

    // Check User(Caller) Balance
    stateful entrypoint checkUserBalance(): int =
      state.receiver[Call.caller].balance

    // Check User(Caller) Balance available from
    stateful entrypoint checkUserBalanceAvailableFrom(): int =
      state.receiver[Call.caller].available_from

    // Check the total balance available in contract
    stateful entrypoint checkContractBalance(): int =
      Contract.balance

    stateful entrypoint getOwner(): address =
      state.deployer

    stateful entrypoint getSumOfTotalBalanceOfUser(): int =
      state.total_balance

    // Withdraw leftovers
    stateful entrypoint withdrawAll() =
      if(Call.caller == state.deployer)
        Chain.spend(Call.caller, Contract.balance-state.total_balance)`;
  }

  //experimental
  public showInTabsOrNot(): boolean {
    return this.showInTabs;
  }
}
