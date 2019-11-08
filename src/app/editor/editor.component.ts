import { Component, OnInit, Input, Compiler, HostBinding, OnChanges, SimpleChanges, ChangeDetectorRef  } from '@angular/core';
import { CompilerService, EncodedACI } from '../compiler.service'
import { Contract } from '../contracts/hamster';
import { ContractControlService } from '../contract-control.service';
import { Subscription, Observable, Subject, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd, ResolveStart } from '@angular/router';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ClipboardService } from 'ngx-clipboard';
import { LogMessage as NgxLogMessage } from 'ngx-log-monitor';
import { debounceTime } from 'rxjs/operators';
import { CodeFactoryService } from '../code-factory.service';
import { LocalStorageService } from '../local-storage.service';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  
  @Input() 
  // logger start //
  logs: NgxLogMessage[] = [
  ];
  
  logStream$: any;

  // logger end // 
  isDimmed: boolean = false;
 
  editorInstance: any; // the editor, initialized by the component

  highlightedRows: any = []; // the rows to highlight (when opening a shared contract)

  // buggy monaco colletion of highlights -emptying this or resetting doesn't remove anything.
  errorHighlights: any = []; // code highlights from compilation errors - reset to empty on every new error and successful compilation
  // workaround for annoying angular bug firing events dozens of times: collect hashes of errors in this map and set new ones only if hash is unused 
  lastError: string;
  currentDecorations: any;

  // debug - multiple instances running, or same code two times?
  runTimes: number = 0;

  // set the editor's style:
  //@HostBinding('attr.class') css = 'ui segment container';

  @HostBinding('style.border') value = 'red';

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
  templateCode: string = '';
  // note if this editor is currently in active tab
  isActiveTab : boolean = true;

  // handles the case of event emitter emitting three error events instead of 1
  previousErrorHash : any = "";
  // import default contract, after that set this with editor's content

  // var for the dimmer, whether the codegenerator is to be displayed or not
  codeGeneratorVisible = false;
  generatedCode : any = ""

  //the currently available contracts - initialized either as default code, or code fetched from DB, later on set by editor content
  // INITIALIZATION RACE DEBUGGING contract: Contract<string>
  contracts: any[] = [];
  activeContract: any;

  constructor(private compiler: CompilerService, 
    private _router: Router, 
    private _route: ActivatedRoute, 
    private http: HttpClient,
    private _clipboardService: ClipboardService,
    private changeDetectorRef: ChangeDetectorRef, 
    private generator: CodeFactoryService, 
    private localStorage: LocalStorageService
    ) { 
      
      // This throttles the requests to the compiler, so not always one is sent once a user types a key, but is delayed a little.
      this.codeChanged.pipe(
      debounceTime(environment.compilerRequestDelay) // wait 1 sec after the last event before emitting last event
      ). // only emit if value is different from previous value
      subscribe(something => {

        // Call your function which calls API or do anything you would like do after a lag of 1 sec
        this.change();
       });
  }

  editorOptions = {theme: 'vs-dark', 
    language: 'aes', 
    cursorBlinking: 'phase', 
    cursorSmoothCaretAnimation:'true',
    renderIndentGuides:'true',
  contextmenu:'true'};

  generatedCodeEditorOptions = {theme: 'vs-dark', 
    language: 'javascript', 
    cursorBlinking: 'phase', 
    cursorSmoothCaretAnimation:'true',
    renderIndentGuides:'true',
    contextmenu:'false',
    minimap:'false'};

  ngOnInit() {
    /* setInterval(() => {
      // fetching logs from compiler...
      this.logs = this.compiler.logs;
    }, 1000); */
/* 
    this.logStream$ = this.logs[1];
    this.logStream$ = this.logs[2]; */

    const syncRoute: any = this._route.snapshot;
    console.log("Die gesamt route: ", syncRoute)
    console.log(">>>>>>Durchlauf:  ",  ++this.runTimes)

    this._route.queryParamMap.subscribe(parameter => {
      // quickfix for stupid racing condition
      this.runTimes++;

      // get the parameters for code highlighting
      let codeToHighlight = parameter.get("highlight");
      try{ this.highlightedRows = codeToHighlight.split('-', 4) } catch(e) {}
      console.log("highlight:", codeToHighlight);
      console.log(this.highlightedRows);
      console.log("Parameters are: ", parameter)

      /* var contractID = parameter.get("contract");
      console.log("contract ID: ", contractID);
 */
      // get contract ID from URl parameter for fetching code from DB
      if(parameter.get("contract") !== null) {
        var contractID = parameter.get("contract");
        console.log("contract ID: ", contractID);
        // call backend
        let requestURL = `${environment.contractSharingBackend}${contractID}`
        console.log("Die request URL ist: ", requestURL);

        //let something = this.http.get(`https://xfs2awe868.execute-api.eu-central-1.amazonaws.com/dev/candidates/9702aa10-b`)

        this.http.get(`${environment.contractSharingBackend}${contractID}`).subscribe(async (res) => {
          // if the backend responds, load contracts from local storage and ...
          // ...initialize a new contract with the code from the backend and push it to the contracts array.
          // if there is no contract in the response, just load the contracts from storage.

          // TODO: Show a message is a contract was tried to be fetched that doesnt exist anymore 

          //console.log("is it there? ", res['contract'])
          if (res['contract'] !== undefined) {
            console.log(">>>>>>>> Debugging storage: All contracts return: ", this.localStorage.showStorage("ALL_CONTRACT_CODES"));
            this.contracts = this.localStorage.getAllContracts();
            // we set the contract fetched from the backend as the new active contract, get its name, assign it to the contract object, and push it to the contracts.
            this.activeContract = new Contract(res['contract'])

            // GET THE CONTRACT'S NAME...
            this.compiler.fromCodeToACI(this.activeContract.code).subscribe(
              (data: EncodedACI) => {
                let namestring = data.encoded_aci.contract.name + " External";
                console.log("Namestring: ", namestring); 
                this.activeContract.nameInTab = namestring;
                console.log("Name in scope ? ", this.activeContract.nameInTab)

                STOPPED HERE 
               })
            // set and push.
            this.activeContract.shareID = contractID;
            console.log(">>>>>>Name and share ID?", this.activeContract.nameInTab, this.activeContract.shareID)
            this.contracts.push(this.activeContract);
          } else {
            console.log(">>>>>>>> Debugging storage: All contracts return: ", this.localStorage.showStorage("ALL_CONTRACT_CODES"));
            this.contracts = this.localStorage.getAllContracts();
            // if there is no contract in the storage initialize an empty one
            this.contracts.length == 0 ? this.contracts.push(new Contract()) : true
            this.activeContract = this.contracts[0];
          }

          // save the current contracts code states to local storage
          this.localStorage.storeAllContracts(this.contracts);

          // next two commands are a workaround for some stupid race condition that leaves the default contract in place
          this.compiler.code = '';
          this.compiler.generateACIonly(this.activeContract.code);
          this.compiler.code = this.activeContract.code;
          
          
          

          // add the highlighter
          if (this.highlightedRows.length > 3) {let rows = this.highlightedRows;
            this.editorInstance.deltaDecorations([], [
              { range: new monaco.Range(rows[0],rows[1],rows[2],rows[3]), options: { inlineClassName: 'problematicCodeLine' }},
            ]);}
        })
      
      } else {
        
        // if there is no contractID provided in the URL, initialize the default one
        // fix for stupid racing condition
        if (this.runTimes >= 2) {
          console.log(">>>>>>>> Debugging storage: All contracts return: ", this.localStorage.showStorage("ALL_CONTRACT_CODES"));
          this.contracts = this.localStorage.getAllContracts();
          // if there is no contract in the storage initialize an empty one
          this.contracts.length == 0 ? this.contracts.push(new Contract()) : true
          this.activeContract = this.contracts[0];
          this.localStorage.storeAllContracts(this.contracts);


        }
        
      }
    });

    // If the compiler asks for code, give it to him and deploy the contract
    this.fetchActiveCodeSubscription = this.compiler._fetchActiveCode
      .subscribe(item => {console.log("Im editor angekommen !"); 
      //console.log("Current code ist: ", this.contract.code)
  
      // TODO: Look into wrong closure of this event listener !

    // if the compiler / debugger submitts errors, highlight them:
    // repetitive compiler errors
    this.newErrorSubscription = this.compiler._notifyCodeError.pipe(
      distinctUntilChanged()
    )
      .subscribe(async error =>  {
          await error;
          //let theError = error.__zone_symbol__value;
          console.log("Nur error: ", error);
        
          // workaround for stupid angular bug calling events dozens of times: hash error in check if it was there already or not
          let errorHash = this.hash(error);
          //console.log("Error hash: ", errorHash) 
          // if angular isn't trying to report the already known error again...
          if (errorHash != this.lastError){
            this.lastError = errorHash; // mark error as used
             
            // remove highlights the soft way...
            this.clearAllHighlighters()

            // add new highlighter
            try{
              this.errorHighlights = [
                // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
              { range: new monaco.Range(error.pos.line,
                                      error.pos.col +1,
                                      error.pos.line,
                                      error.pos.col), options: { inlineClassName: 'errorMarker', marginClassName: 'problematicCodeLine' }},
              ]
            
              this.currentDecorations = this.editorInstance.deltaDecorations([], this.errorHighlights)
            } catch(e){
              console.log("triedd adding highlights...")
            }

            //this.removeDuplicates("errorMarker");

          } else {
            //console.log("tried adding known error.")
          }
          //this.removeDuplicates("errorMarker");
      })  

       // fires when new contract got compiled
       this.rawACIsubscription = this.compiler._notifyCompiledAndACI
       .subscribe(item => { console.log("Neue ACI für init ist da !", item) 
       if (Object.entries(item).length > 0) {
         //console.log("Clearing error marker..");
        this.clearAllHighlighters();
         
         // reset the error tracker
         //console.log("Resetting last known error..");
         this.lastError = "";} else {
           console.log("Empty ACI was received, not removing error");
         }
        });
 

    // try generating ACI for init-interface
    this.compiler.generateACIonly(this.activeContract.code);
    
    //  return this.compile();


    this.codeGenerator = this.generator._generateCode.subscribe(code => {
      if (Object.entries(code).length > 0)// <-- marie, aufpassen !
      this.codeGeneratorVisible = true;

      console.log(">>>>>>>>>>>> Codegeneration parameters are:", code);
      
      this.generatedCode = `${code}`;
      setTimeout(() => {
        var el = document; // This can be your element on which to trigger the event
        var event = document.createEvent('HTMLEvents');
        event.initEvent('resize', true, false);
        el.dispatchEvent(event)

        console.log("changedetector ran");
      }, 50);
      

           
     });

  }); 
  }

  // initializes editor object to interact with - called by the editor component
  initializeEditorObject(theEditor: monaco.editor.IStandaloneCodeEditor){
    //console.log("The editor:", theEditor._actions["editor.foldAll"]._run());
    //console.log("The editor:", theEditor);    
    this.editorInstance = theEditor;
    // highlight background of shared code
    // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
    if (this.highlightedRows.length > 3) {let rows = this.highlightedRows;
      setTimeout(() => {
        this.editorInstance.deltaDecorations([], [
          { range: new monaco.Range(rows[0],rows[1],rows[2],rows[3]), options: { inlineClassName: 'problematicCodeLine'}},
        ])
      }, 400);
      ;}


    // custom context menu options
    this.editorInstance.addAction ({
        // ID of the group in which the new item will appear.
        contextMenuGroupId: '1_modification',
        // there are three of them: 1 - 'navigation', 2 - '1_modification', 3 - '9_cutcopypaste';
        // you can create your own
        contextMenuOrder: 3, // order of a menu item within a group
        label: '<i class="share alternate icon"></i> Share contract and selection...',
        id: 'showDiff',
        keybindings: [], // Hotkeys
        // function called when clicking
        // press the specified keys
        run: () => {console.log(this.compiler.activeCodeSelection)
          let postData = {"contract":this.activeContract.code ,"contractName": "some", "editorVersion":1}
          console.log("So sieht post data aus:", postData);

          this.http.post(environment.contractSharingBackend, postData, {
            headers: new HttpHeaders({
                'Content-Type':  'application/json'
              })
          }).subscribe(data=>{
            console.log("Post hat ergeben?", data)

            var constructedUrl;
            var s = this.compiler.activeCodeSelection || "";
            
            // share code with our without highlighter
            if (s.endLineNumber != undefined){
              constructedUrl = `${environment.appUrl}?highlight=${s.endLineNumber}-${s.endColumn}-${s.startLineNumber}-${s.startColumn}&contract=${data['candidateId']}`
            } else {
              constructedUrl = `${environment.appUrl}?contract=${data['candidateId']}`
            }
            
            console.log("DIE URL: ", constructedUrl)
            this._clipboardService.copyFromContent(constructedUrl);
            // display success message ;)
            this.isDimmed = true;
            // tell angular to detect changes because we're in a event subscription here -.-
            this.changeDetectorRef.detectChanges()
              setTimeout(() => {
                this.isDimmed = false;
                this.changeDetectorRef.detectChanges()
              }, 900);

          });

        }
      });

    // when right-clicking
    this.editorInstance.onContextMenu(function (e) {
      console.log("Läuft?", e)
    });

    // when selecting code
    this.editorInstance.onDidChangeCursorSelection( (result) => {
      // log selection coordinates only if it's actually a selection, not just a click.
      if (result.selection.endColumn != result.selection.startColumn && result.selection.startLineNumber != result.selection.endLineNumber) {
          this.compiler.activeCodeSelection = result.selection;
          console.log("selected: ", result.selection);
          }
    });

    // when moving mouse lol
    /* this.editorAction = theEditor.onDidChangeCursorPosition
        .subscribe(async peng => {
          console.log(peng);
        }) */
  }
  throttledChange(){
    this.codeChanged.next();
  }
  codeChanged: Subject<string> = new Subject<string>();

  change(){
    //console.log("Shit done changed!");
    // put the active code into compiler
    this.compiler.makeCompilerAskForCode(0);
    console.log("code ist gerade: ",this.activeContract.code);
    // generate some ACI just to display init() function for deployment
    this.compiler.generateACIonly(this.activeContract.code);
  }

  // clear highlighters by identifier
  clearAllHighlighters(){
    //clear all existing
    try{        
      this.currentDecorations = this.editorInstance.deltaDecorations(this.currentDecorations, [])
    } catch(e){
    }
    
  }

  // helpers

  sortObjectKeys(obj){
        if(obj == null || obj == undefined){
            return obj;
        }
        if(typeof obj != 'object'){ // it is a primitive: number/string (in an array)
            return obj;
        }
        return Object.keys(obj).sort().reduce((acc,key)=>{
            if (Array.isArray(obj[key])){
                acc[key]=obj[key].map(this.sortObjectKeys);
            }
            else if (typeof obj[key] === 'object'){
                acc[key]=this.sortObjectKeys(obj[key]);
            }
            else{
                acc[key]=obj[key];
            }
            return acc;
        },{});
  }

  toHex = function (_input) {
      var ret = ((_input<0?0x8:0)+((_input >> 28) & 0x7)).toString(16) + (_input & 0xfffffff).toString(16);
      while (ret.length < 8) ret = '0'+ret;
      return ret;
  };

  hash = function hashCode(o, l?) {
    o = this.sortObjectKeys(o);
    l = l || 2;
    var i, c, r = [];
    for (i=0; i<l; i++)
        r.push(i*268803292);
    function stringify(o) {
        var i,r;
        if (o === null) return 'n';
        if (o === true) return 't';
        if (o === false) return 'f';
        //if (o instanceof Date) return 'd:'+(0+o);
        i=typeof o;
        if (i === 'string') return 's:'+o.replace(/([\\\\;])/g,'\\$1');
        if (i === 'number') return 'n:'+o;
        if (o instanceof Function) return 'm:'+o.toString().replace(/([\\\\;])/g,'\\$1');
        if (o instanceof Array) {
            r=[];
            for (i=0; i<o.length; i++) 
                r.push(stringify(o[i]));
            return 'a:'+r.join(';');
        }
        r=[];
        for (i in o) {
            r.push(i+':'+stringify(o[i]))
        }
        return 'o:'+r.join(';');
    }
    o = stringify(o);
    for (i=0; i<o.length; i++) {
        for (c=0; c<r.length; c++) {
            r[c] = (r[c] << 13)-(r[c] >> 19);
            r[c] += o.charCodeAt(i) << (r[c] % 24);
            r[c] = r[c] & r[c];
        }
    }
    for (i=0; i<r.length; i++) {
        r[i] = this.toHex(r[i]);
    }
    return r.join('');
  }

  closeCodeEditor = () => {
    this.codeGeneratorVisible = false;
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.fetchActiveCodeSubscription.unsubscribe();
    this.newErrorSubscription.unsubscribe();
  }
  

}
