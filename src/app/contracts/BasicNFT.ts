export class BasicNFT {
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
    this.contractUID = String(Date.now() + 5);
    if (params._nameInTab != undefined) this.nameInTab = params._nameInTab;
    if (params._shareId != undefined) this.shareId = params._shareId;
    this.code =
      params._code ??
      `
        // Safe transfer is not implemented in this contract -
// - Which means token sent to someone who don't know how to handle Erc721 may result in token lost
// However the method of receiver verification (base of safe transfer) is not hard to implement...

@compiler >= 6

include "String.aes"

contract BasicNFT =

    record state = {
        name : string,
        token_owner : map(string, address),
        token_owns : map(address, int),
        token_approvals: map(string, address),
        token_own_names: map(address, list(map(string, bool))) // true if that token is still holding
        }


    stateful entrypoint init(name : string) =
        { name = name,
            token_owner = {},
            token_owns = {},
            token_approvals = {},
            token_own_names = {}}

    entrypoint getName() =
        state.name

    // get owner
    public entrypoint ownerOfToken(_token_id: string) : option(address) =
        Map.lookup(_token_id, state.token_owner)

    // get approved for token
    public entrypoint approvedForToken(_token_id: string) : option(address) =
        Map.lookup(_token_id, state.token_approvals)

    // transfer token
    public stateful entrypoint transfer (_to: address, _token_id: string) =
        require(String.length(_token_id) >= 1, "Token Id required")

        clearApproval(Some(Call.caller), _token_id)
        removeTokenFrom(Call.caller, _token_id)
        addTokenTo(_to, _token_id)
        // Since reentrancy attacks not possible in sophia, so increment added first because of the below code effects but if there is another attack please feel free to suggest that i should put increment below decrement


    // clear approval from a token
    private stateful function clearApproval(_user: option(address), _token_id: string): bool =
        require(ownerOfToken(_token_id) == _user, "For clearApproval Owner of token is not you!")
        if(Map.member(_token_id, state.token_approvals))
          Map.delete(_token_id, state.token_approvals)
          true
        else
          false

    // add operation
    private stateful function addTokenTo(_to: address, _token_id: string) =
        require(String.length(_token_id) >= 1, "Token Id required")

        put(state{token_owner[_token_id] = _to})

        let old_token_owns_value = Map.lookup(_to, state.token_owns)
        if(old_token_owns_value == None)
            put(state{token_owns[_to] = 1 })
        else
            put(state{token_owns[_to] = state.token_owns[_to] + 1})
        put(state{token_own_names[_to] = [{[_token_id] = true}] })

    // remove operation
    private stateful function removeTokenFrom(_from: address, _token_id: string): string =
        require(String.length(_token_id) >= 1, "Token Id required")
        if((ownerOfToken(_token_id) == Some(_from)) || (approvedForToken(_token_id) == Some(_from)))
          Map.delete(_token_id, state.token_owner)
          put(state{token_owns[_from] = state.token_owns[_from] - 1 })
          put(state{token_own_names[Call.caller] = [{[_token_id] = false}] })
          "Done"

        else
          "cannot done"

    // mint token
    public stateful entrypoint mint(_token_id: string) =
        require(String.length(_token_id) >= 1, "Token Id required")
        require(ownerOfToken(_token_id) == None, "Token id already exist")

        addTokenTo(Call.caller, _token_id)

    // burn token
    public stateful entrypoint burn(_token_id: string) =
        require(String.length(_token_id) >= 1, "Token Id required")

        clearApproval(Some(Call.caller), _token_id)
        removeTokenFrom(Call.caller, _token_id)

    // approve someone (will have same rights as owner)
    public stateful entrypoint approve(_to: address, _token_id: string) =
        require(String.length(_token_id) >= 1, "Token Id required")
        require(ownerOfToken(_token_id) == Some(Call.caller), "The owner is not you for this token id yet!.")

        put(state{token_approvals[_token_id] = _to})

    // get caller's sum of current owned tokens
    public entrypoint sumOfTokenOwns (): option(int) =
        Map.lookup(Call.caller, state.token_owns)

    // get list of tokens owner (true) or not have access to now (false)
    public entrypoint allTokensOwnedOrNotNow () : option(list(map(string, bool))) =
        Map.lookup(Call.caller, state.token_own_names)`;
  }

  //experimental
  public showInTabsOrNot(): boolean {
    return this.showInTabs;
  }
}
