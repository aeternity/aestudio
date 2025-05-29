import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import type monaco from 'monaco-editor';
import { CompilerService } from '../compiler.service';
import { Contract } from '../contracts/hamster';
import { AeForUsers } from '../contracts/AeForUsers';
import { AeUnlockOnTime } from '../contracts/AeUnlockOnTime';
import { FungibleToken } from '../contracts/FungibleToken';
import { BasicNFT } from '../contracts/BasicNFT';
import { Subscription, Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ClipboardService } from 'ngx-clipboard';
import { CodeFactoryService } from '../code-factory.service';
import { LocalStorageService } from '../local-storage.service';
import { AuthService } from '../services/auth/auth.service';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit, OnDestroy {
  @Input()
  // logger start //
  /* logs: NgxLogMessage[] = [
  ]; */
  logStream$: any;

  // logger end //
  isDimmed = false;

  editorInstance: any; // the editor, initialized by the component

  highlightedRows: any = []; // the rows to highlight (when opening a shared contract)

  // buggy monaco colletion of highlights -emptying this or resetting doesn't remove anything.
  errorHighlights: any = []; // code highlights from compilation errors - reset to empty on every new error and successful compilation
  // workaround for annoying angular bug firing events dozens of times: collect hashes of errors in this map and set new ones only if hash is unused
  lastError: string;
  currentDecorations: any;

  // debug - multiple instances running, or same code two times?
  runTimes = 0;

  // set the editor's style:
  //@HostBinding('attr.class') css = 'ui segment container';

  //@HostBinding('style.border') value = 'red';

  //Fires when the SDK does something
  editorAction: Subscription;

  // listen to compiler events asking to send code
  fetchActiveCodeSubscription: Subscription;

  // listen for new errors
  newErrorSubscription: Subscription;

  // Listen to compilation success (e.g. to remove highlights)
  rawACIsubscription: Subscription;

  // Listen to compilation success (e.g. to remove highlights)
  codeGenerator: Subscription;
  templateCode = '';

  // store all contractUIDs that are to be shown in the tabs
  activeTabUIDs: string[] = [];

  // the currently opened tab's UID
  currentTabUID = '1574358512052';

  // handles the case of event emitter emitting three error events instead of 1
  previousErrorHash: any = '';
  // import default contract, after that set this with editor's content

  //the currently available contracts - initialized either as default code, or code fetched from DB, later on set by editor content

  contracts: any[] = [];
  activeContract: any;

  codeChanged: Subject<string> = new Subject<string>();

  // used to change the sizes of editor and console log, open / close.
  public handleConsoleOpen(event) {
    this.state.consoleOpen = event;
  }

  constructor(
    private compiler: CompilerService,
    private _router: Router,
    private _route: ActivatedRoute,
    private http: HttpClient,
    private _clipboardService: ClipboardService,
    private changeDetectorRef: ChangeDetectorRef,
    public generator: CodeFactoryService,
    private localStorage: LocalStorageService,
    private authService: AuthService,
    public state: StateService,
  ) {
    // deprecation testing
    /* // This throttles the requests to the compiler, so not always one is sent once a user types a key, but is delayed a little.
      this.codeChanged.pipe(
      debounceTime(environment.compilerRequestDelay) // wait 1 sec after the last event before emitting last event
      ). // only emit if value is different from previous value
      subscribe(something => {
        // Call your function which calls API or do anything you would like do after a lag of 1 sec
        this.change();
       }); */
  }

  editorOptions = {
    theme: 'vs-dark',
    language: 'aes',
    cursorBlinking: 'phase',
    cursorSmoothCaretAnimation: 'true',
    renderIndentGuides: 'true',
    contextmenu: 'true' /* ,
    scrollBeyondLastLine: 'false',
    automaticLayout: 'true' */,
  };

  generatedCodeEditorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    cursorBlinking: 'phase',
    cursorSmoothCaretAnimation: 'true',
    renderIndentGuides: 'true',
    contextmenu: 'false',
    minimap: 'false',
  };

  ngOnInit() {
    /*
    this.state.editor.tabHeight = document.getElementById('tabMenu').offsetHeight;
    this.state.editor.menuHeight = document.getElementById('logoHeader').offsetHeight;
    this.state.editor.viewportHeight = window.innerHeight
    this.state.editor.logConsoleHeight = document.getElementById('logConsole').offsetHeight; */

    this.state.editor.recalculateEditorHeight();

    setInterval(() => {
      this.state.editor.recalculateEditorHeight();
      console.log('oneEditorHeight', this.state.editor.finalHeight);
    }, 5000);

    /* setInterval(() => {
      // fetching logs from compiler...
      this.logs = this.compiler.logs;
    }, 1000); */
    /*
        this.logStream$ = this.logs[1];
        this.logStream$ = this.logs[2]; */

    const syncRoute: any = this._route.snapshot;
    console.log('Die gesamt route:', syncRoute);
    console.log('>>>>>>Durchlauf: ', ++this.runTimes);

    this._route.queryParamMap.subscribe(async (parameter) => {
      // quickfix for stupid racing condition
      this.runTimes++;
      console.log('Run times:', this.runTimes);
      // get the parameters for code highlighting
      let codeToHighlight = '';

      if (parameter.get('highlight') != undefined) {
        codeToHighlight = parameter.get('highlight') || '';
        try {
          this.highlightedRows = codeToHighlight.split('-', 4);
          // eslint-disable-next-line no-empty
        } catch {}
      }
      console.log('highlight:', codeToHighlight);
      console.log('Highlighted rows:', this.highlightedRows);
      console.log('Parameters are:', parameter);

      /* var contractID = parameter.get("contract");
      console.log("contract ID:", contractID);
 */

      // contract sharing feature - deactivated for now

      // get contract ID from URl parameter for fetching code from DB
      /*      if (parameter.get("contract") !== null || parameter.get("contractCode") !== null ) {




        var contractCode : any
        if (parameter.get("contract") !== null) {
          var contractID = parameter.get("contract");
          contractCode = await this.authService.getSharedContract(contractID)
          console.log("fetched contract ID:", contractID);
        } else {
          var codeURL = parameter.get("contract")
          try {
            let response = await fetch(codeURL);
            contractCode = await response.json()
          } catch(e) {
            console.log("Error loading external code:", e)
          }
        }

        //let something = this.http.get(`https://xfs2awe868.execute-api.eu-central-1.amazonaws.com/dev/candidates/9702aa10-b`)

        //let contractCode = await this.authService.getSharedContract(contractID)


          // if the backend responds, load contracts from local storage and ...
          // ...initialize a new contract with the code from the backend and push it to the contracts array.
          // if there is no contract in the response, just load the contracts from storage.

          // TODO: Show a message if a contract was tried to be fetched that doesnt exist (anymore)

          //console.log("is it there?", res['contract'])

          if (contractCode != undefined) {

            //console.log(">>>>>>>> Debugging storage: All contracts return:", this.localStorage.showStorage("ALL_CONTRACT_CODES"));
            this.contracts = this.localStorage.getAllContracts();

            // we set the contract fetched from the backend as the new active contract, get its name, create a new contract object, and push it to the contracts.

            // GET THE CONTRACT'S NAME...

            this.compiler.fromCodeToACI(contractCode).subscribe(
              (data: EncodedACI) => {
                // set the contract to a fixed external name
                let namestring = `${data.encoded_aci.contract.name} [External]`;
                data.encoded_aci.contract.name = namestring
                this.activeContract.nameInTab = namestring;
                this.activeContract = new Contract({ _code: contractCode, _nameInTab: namestring, _latestAcI : data.encoded_aci.contract })

                console.log("Editor new contract:", this.activeContract)

                // TODO : make being the active tab a property to the contract object and tell tab shit to use it !

                // set contract parameters
                this.activeContract.shareId = contractID;
                this.activeContract.sharingHighlighters = this.highlightedRows;
                console.log(">>>>>>Name and share ID?", this.activeContract.nameInTab, this.activeContract.shareID)

                // only push this shared contract into the array of active contracts if it's not known yet
                var contractExists: boolean = false;
                console.log(" same?", this.contracts[0].shareId);
                console.log(" same?", this.activeContract);
                console.log("same ?", this.contracts[0].shareId == this.activeContract.shareId);

                // check if the contract is already there...
                this.contracts.forEach((oneContract) => {
                  console.log("save oneContract.shareId :", oneContract.shareId);
                  if (oneContract.shareId == this.activeContract.shareId) {
                    // if the contract already exists, set it's highlighted rows though!
                    this.activeContract.sharingHighlighters = this.highlightedRows;
                    contractExists = true;
                  };
                })

                console.log("save ContractExists:", contractExists)
                // if no contract with this shareID was found, push it.
                contractExists == false ? this.contracts.push(this.activeContract) : true

                //  put this contract in the tabs
                this.activeTabUIDs.push(this.activeContract.contractUID);
                // TODO make this tab the active one
                //old idea: this.currentTabUID = this.activeContract.contractUID;

                // save the current contracts code states to local storage
                this.localStorage.storeAllContracts(this.contracts);


                // save the highlighted rows to the contract object
                if (this.highlightedRows.length > 3) {
                  let rows = this.highlightedRows;
                  this.editorInstance.deltaDecorations([], [
                    { range: new monaco.Range(rows[0], rows[1], rows[2], rows[3]), options: { inlineClassName: 'problematicCodeLine' } },
                  ]);
                }



              })

          } else {

            console.log(">>>>>>>> Debugging storage: All contracts return:", this.localStorage.showStorage("ALL_CONTRACT_CODES"));
            this.contracts = this.localStorage.getAllContracts();
            // if there is no contract in the storage initialize an empty one
            this.contracts.length == 0 ? this.contracts.push(new Contract({})) : true
            this.activeContract = this.contracts[0];
            // moved this to ngAfterViewInit because of racing conditions between this and the tabs - this.currentTabUID = this.activeContract.contractUID;

            // save the current contracts code states to local storage
            this.localStorage.storeAllContracts(this.contracts);
          }



          // next two commands are a workaround for some stupid race condition that leaves the default contract in place
          this.compiler.code = '';
          this.compiler.generateACIonly({ sourceCode: this.activeContract.code, contractUID: this.activeContract.contractUID });
          this.compiler.code = this.activeContract.code;




      } else {
 */

      // if there is no contractID provided in the URL, initialize the default one
      // fix for stupid racing condition
      if (this.runTimes >= 2) {
        console.log(
          '>>>>>>>> Debugging storage: All contracts return:',
          this.localStorage.showStorage('ALL_CONTRACT_CODES'),
        );
        this.contracts = this.localStorage.getAllContracts();
        // if there is no contract in the storage initialize an empty one
        if (this.contracts.length == 0) {
          this.contracts.push(new Contract({}));
          this.contracts.push(new AeForUsers({}));
          this.contracts.push(new AeUnlockOnTime({}));
          this.contracts.push(new FungibleToken({}));
          this.contracts.push(new BasicNFT({}));

          this.activeContract = this.contracts[0];

          this.localStorage.storeAllContracts(this.contracts);
        }
      }

      // contract sharing feature - deactivated for now
      // }
    });

    // If the compiler asks for code, give it to him and deploy the contract
    this.fetchActiveCodeSubscription = this.compiler._fetchActiveCode.subscribe(() => {
      console.log('Im editor angekommen !');
      //console.log("Current code ist:", this.contract.code)

      try {
        // try generating ACI for init-interface
        this.compiler.generateACIonly({
          sourceCode: this.activeContract.code,
          contractUID: this.activeContract.contractUID,
        });
      } catch (e) {
        console.log('Editor.component Error (no code yet):', e);
      }
    });

    // receives the raw result from code generator
    this.codeGenerator = this.generator.code$.subscribe(() => {
      // workaround for code window not showing:
      this.triggerWindowRefresh();
    });

    // remove when implementing fix for #8 - introduce means to dynamically controll which tab is active
    setTimeout(() => {
      this.setTabAsActive(this.contracts[0]);
    }, 1500);

    console.log('activeContract Contracts:', this.contracts);
    this.setTabAsActive(this.contracts[0]);
  }

  // initializes editor object to interact with - called by the editor component
  initializeEditorObject(theEditor: monaco.editor.IStandaloneCodeEditor) {
    //console.log("The editor:", theEditor._actions["editor.foldAll"]._run());
    //console.log("The editor:", theEditor);
    this.editorInstance = theEditor;

    this.triggerWindowRefresh();

    // highlight background of shared code
    // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
    /*  if (this.highlightedRows.length > 3) {let rows = this.highlightedRows;
        setTimeout(() => {
          this.editorInstance.deltaDecorations([], [
            { range: new monaco.Range(rows[0],rows[1],rows[2],rows[3]), options: { inlineClassName: 'problematicCodeLine'}},
          ])
        }, 300);
        ;} */

    /// WIP: Enable only if user is logged in. example: https://microsoft.github.io/monaco-editor/playground.html#interacting-with-the-editor-adding-a-command-to-an-editor-instance
    // Step 1:
    // const myCondition = this.editorInstance.createContextKey('myCondition', false);

    // custom context menu options
    this.editorInstance.addAction({
      // ID of the group in which the new item will appear.
      contextMenuGroupId: '1_modification',
      // there are three of them: 1 - 'navigation', 2 - '1_modification', 3 - '9_cutcopypaste';
      // you can create your own
      contextMenuOrder: 3, // order of a menu item within a group
      label: '<i class="share alternate icon"></i> Share contract and selection...',
      id: 'showDiff',
      /* precondition: false, */
      keybindings: [], // Hotkeys
      // function called when clicking
      // press the specified keys
      run: () => {
        console.log(this.compiler.activeCodeSelection);
        const postData = {
          contract: this.activeContract.code,
          contractName: 'some',
          editorVersion: 1,
        };
        console.log('So sieht post data aus:', postData);

        this.http
          .post(environment.contractSharingBackend, postData, {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
            }),
          })
          .subscribe((data) => {
            console.log('Post hat ergeben?', data);

            let constructedUrl;
            const s = this.compiler.activeCodeSelection || '';

            // share code with our without highlighter
            if (s.endLineNumber != undefined) {
              constructedUrl = `${environment.appUrl}?highlight=${s.endLineNumber}-${s.endColumn}-${s.startLineNumber}-${s.startColumn}&contract=${data['candidateId']}`;
            } else {
              constructedUrl = `${environment.appUrl}?contract=${data['candidateId']}`;
            }

            console.log('DIE URL:', constructedUrl);
            this._clipboardService.copyFromContent(constructedUrl);
            // display success message ;)
            this.isDimmed = true;
            // tell angular to detect changes because we're in a event subscription here -.-
            this.changeDetectorRef.detectChanges();
            setTimeout(() => {
              this.isDimmed = false;
              this.changeDetectorRef.detectChanges();
            }, 900);
          });
      },
    });

    // when right-clicking
    this.editorInstance.onContextMenu(function (e) {
      console.log('Läuft?', e);
    });

    // when selecting code
    this.editorInstance.onDidChangeCursorSelection((result) => {
      // log selection coordinates only if it's actually a selection, not just a click.
      if (
        result.selection.endColumn != result.selection.startColumn &&
        result.selection.startLineNumber != result.selection.endLineNumber
      ) {
        this.compiler.activeCodeSelection = result.selection;
        //console.log("selected:", result.selection);
      }
    });

    // when moving mouse lol
    /* this.editorAction = theEditor.onDidChangeCursorPosition
          .subscribe(async peng => {
            console.log(peng);
          }) */
  }

  deleteContract($event) {
    console.log('Contract: delete emitted !', $event);
    // remove the clicked contract from the array...
    this.contracts.forEach((contract, i) => {
      console.log('event uid:', $event.contractUID);
      if (contract.contractUID == $event.contractUID) {
        console.log('Editor: Contract to delete found!');
        this.contracts.splice(i, 1);
        this.localStorage.storeAllContracts(this.contracts);
      }
    });
  }

  throttledChange() {
    this.codeChanged.next();
  }

  // DEPRECATION TEST (dactivated for testing!) Tabs functionality start
  setTabAsActive(_oneContract: any) {
    this.compiler.activeContract = _oneContract; // tell the compiler which tab is active, too
    this.activeContract = _oneContract;
    // change all the other contracts to inactive - maybe ?

    this.compiler.generateACIonly({
      sourceCode: this.activeContract.code,
      contractUID: this.activeContract.contractUID,
    });

    //this.compiler.code = this.activeContract.code;
  }

  // Tabs functionality end

  // helpers:

  // saves all contracts
  saveActiveContractChangesToContractsArray() {
    this.contracts.forEach((oneContract, index, array) => {
      if (oneContract.contractUID == this.activeContract.UID) array[index] = this.activeContract;
      //and save:
      this.localStorage.storeAllContracts(this.contracts);
    });
  }

  // saves changes of any contract you pass to this function
  saveContractChangesToContractsArray(_contract: any) {
    console.log('Received contract for saving :', _contract);
    // console.log("suche contract zum aktualisieren...")
    this.contracts.forEach((oneContract, index, array) => {
      if (oneContract.contractUID == _contract.contractUID) {
        array[index] = _contract;
        //console.log("Changes of one contract saved!");
        this.localStorage.storeAllContracts(this.contracts);
      }
    });
    this.localStorage.storeAllContracts(this.contracts);

    this.changeDetectorRef.detectChanges();
  }

  // clear highlighters (todo: by identifier)
  clearAllHighlighters() {
    try {
      this.currentDecorations = this.editorInstance.deltaDecorations(this.currentDecorations, []);
      this.activeContract.errorHighlights = [];
      this.saveActiveContractChangesToContractsArray();
      // eslint-disable-next-line no-empty
    } catch {}
  }

  // trigger whether the contract is displayed in the tabs or not
  toggleTabAppearance(_params: any) {
    this.contracts.forEach((oneContract) => {
      //console.log("Editor: Comparing with contractUID:", oneContract.contractUID)
      //console.log("save oneContract.shareId :" , oneContract.shareId);
      //console.log("Editor: Clicked on contract:", _params.contract)
      //console.log("Editor: In this case, these are the contracts:", this.contracts)
      if (oneContract.contractUID == _params.contract.contractUID) {
        switch (_params.triggerMode) {
          case 'off': {
            // check if at least another tab is open
            let tabsOpenCount = 0;
            this.contracts.forEach((contract) => {
              if (contract.showInTabs) tabsOpenCount++;
            });
            // if at least 2 are open, close current tab
            if (tabsOpenCount >= 2) oneContract.showInTabs = false;
            break;
          }
          case 'on':
            oneContract.showInTabs = true;
            break;
          case 'trigger':
            oneContract.showInTabs = !oneContract.showInTabs;
            break;
          default:
            break;
        }
      }
      // i thibnk this is not used anymore ? or maybe for setting the code in the compiler in order to talk to the right sidebar
      //, to be deprecated soon ?
      return oneContract.contractUID == this.activeContract.contractUID;
    });

    this.localStorage.storeAllContracts(this.contracts);
    this.changeDetectorRef.detectChanges();
  }

  addNewContract() {
    console.log('comparing.. right now there are', this.contracts.length);
    const newContract = new Contract({});
    console.log('new contract ist:', newContract);
    this.contracts.push(newContract);
    this.localStorage.storeAllContracts(this.contracts);
    this.changeDetectorRef.detectChanges();
    console.log('comparing.. now there are', this.contracts.length);
  }
  sortObjectKeys(obj) {
    if (obj == null || obj == undefined) {
      return obj;
    }
    if (typeof obj != 'object') {
      // it is a primitive: number/string (in an array)
      return obj;
    }
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        if (Array.isArray(obj[key])) {
          acc[key] = obj[key].map(this.sortObjectKeys);
        } else if (typeof obj[key] === 'object') {
          acc[key] = this.sortObjectKeys(obj[key]);
        } else {
          acc[key] = obj[key];
        }
        return acc;
      }, {});
  }

  toHex = function (_input) {
    let ret =
      ((_input < 0 ? 0x8 : 0) + ((_input >> 28) & 0x7)).toString(16) +
      (_input & 0xfffffff).toString(16);
    while (ret.length < 8) ret = '0' + ret;
    return ret;
  };

  hash = function hashCode(o, l?) {
    o = this.sortObjectKeys(o);
    l = l || 2;
    let i, c;
    const r = [];
    for (i = 0; i < l; i++) r.push(i * 268803292);
    function stringify(o) {
      let i: any;
      let r: any = [];
      if (o === null) return 'n';
      if (o === true) return 't';
      if (o === false) return 'f';
      //if (o instanceof Date) return 'd:'+(0+o);
      i = typeof o;
      if (i === 'string') return 's:' + o.replace(/([\\\\;])/g, '\\$1');
      if (i === 'number') return 'n:' + o;
      if (o instanceof Function) return 'm:' + o.toString().replace(/([\\\\;])/g, '\\$1');
      if (o instanceof Array) {
        r = [];
        for (i = 0; i < o.length; i++) r.push(stringify(o[i]));
        return 'a:' + r.join(';');
      }
      r = [];
      for (i in o) {
        r.push(i + ':' + stringify(o[i]));
      }
      return 'o:' + r.join(';');
    }
    o = stringify(o);
    for (i = 0; i < o.length; i++) {
      for (c = 0; c < r.length; c++) {
        r[c] = (r[c] << 13) - (r[c] >> 19);
        r[c] += o.charCodeAt(i) << r[c] % 24;
        r[c] = r[c] & r[c];
      }
    }
    for (i = 0; i < r.length; i++) {
      r[i] = this.toHex(r[i]);
    }
    return r.join('');
  };

  closeCodeEditor = () => {
    this.generator.contract$.next(undefined);
  };

  // if stupid-ass chrome won't render the editor but show it as a small square instead..
  triggerWindowRefresh(millisecondsDelay?: number) {
    setTimeout(() => {
      const el = document; // This can be your element on which to trigger the event
      const event = document.createEvent('HTMLEvents');
      event.initEvent('resize', true, false);
      el.dispatchEvent(event);
    }, millisecondsDelay || 55);
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.fetchActiveCodeSubscription.unsubscribe();
    this.newErrorSubscription.unsubscribe();
  }
}
