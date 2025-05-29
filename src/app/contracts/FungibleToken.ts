export class FungibleToken {
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
    this.contractUID = String(Date.now() + 3);
    if (params._nameInTab != undefined) this.nameInTab = params._nameInTab;
    if (params._shareId != undefined) this.shareId = params._shareId;
    this.code =
      params._code ??
      `

// ISC License
//
// Copyright (c) 2017, aeternity developers
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
// AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
// LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
// OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
// PERFORMANCE OF THIS SOFTWARE.


// THIS IS NOT SECURITY AUDITED
// DO NEVER USE THIS WITHOUT SECURITY AUDIT FIRST

@compiler >= 6

include "Option.aes"
include "String.aes"

/// @title - Fungible token basic
contract FungibleToken =

  // This defines the state of type record encapsulating the contract's mutable state
  record state =
    { owner        : address      // the smart contract's owner address
    , total_supply : int          // total token supply
    , balances     : balances     // balances for each account
    , meta_info    : meta_info
    , minted : bool }  // token meta info (name, symbol, decimals)

  // This is the meta-information record type
  record meta_info =
    { name     : string
    , symbol   : string
    , decimals : int }

  // This is a type alias for the balances map
  type balances = map(address, int)

  // Declaration and structure of datatype event
  // and events that will be emitted on changes
  datatype event = Transfer(address, address, int)


  stateful entrypoint mint_coin(name: string, decimals : int, symbol : string, initial_owner_balance : option(int)) =
    require(state.minted == false, "The token is already minted")
    // If the name lenght is less than 1 symbol abort the execution
    require(String.length(name) >= 1, "STRING_TOO_SHORT_NAME")
    // If the symbol length is less than 1 symbol abort the execution
    require(String.length(symbol) >= 1, "STRING_TOO_SHORT_SYMBOL")
    // If the provided value for decimals is negative abort the execution
    require_non_negative_value(decimals)
    // If negative initial owner balance is passed, abort the execution
    let initial_supply = Option.default(0, initial_owner_balance)
    require_non_negative_value(initial_supply)

    let owner = Call.caller
    put(state{ owner = owner,
      total_supply = initial_supply,
      balances     = Option.match({}, (balance) => { [owner] = balance }, initial_owner_balance),
      meta_info    = { name = name, symbol = symbol, decimals = decimals },
      minted = true })
  // Create a fungible token with
  // the following name symbol and decimals
  // and set the inital smart contract state

  // For some reason Init don't initialize with mint values, But contract interface do so using seperate function to mint tokens...
  entrypoint init() =
    { owner        = Contract.address,
      total_supply = 0,
      balances     = {},
      meta_info    = { name = "", symbol = "", decimals = 0 },
      minted = false }

  // Get the token meta info
  entrypoint meta_info() : meta_info =
    state.meta_info

  // Get the token total supply
  entrypoint total_supply() : int =
    state.total_supply

  // Get the token owner address
  entrypoint owner() : address =
    state.owner

  // Get the balances state
  entrypoint balances() : balances =
    state.balances

  // Get balance for address of owner
  // returns option(int)
  // If the owner address haven't had any token balance
  // in this smart contract the return value is None
  // Otherwise Some(int) is returned with the current balance
  entrypoint balance(account: address) : option(int) =
    Map.lookup(account, state.balances)


  function require_non_negative_value(value : int) =
    require(value >= 0, "NON_NEGATIVE_VALUE_REQUIRED")

  function require_balance(account : address, value : int) =
    switch(balance(account))
      Some(balance) =>
        require(balance >= value, "ACCOUNT_INSUFFICIENT_BALANCE")
      None => abort("BALANCE_ACCOUNT_NOT_EXISTENT")

  stateful entrypoint internal_transfer(from_account: address, to_account: address, value: int) =
    require_non_negative_value(value)
    require_balance(from_account, value)
    put(state{ balances[from_account] @ b = b - value })
    put(state{ balances[to_account = 0] @ b = b + value })
    Chain.event(Transfer(from_account, to_account, value))`;
  }

  //experimental
  public showInTabsOrNot(): boolean {
    return this.showInTabs;
  }
}
