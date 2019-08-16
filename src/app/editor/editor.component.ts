import { Component, OnInit, Input, Compiler, HostBinding, OnChanges, SimpleChanges, ChangeDetectorRef  } from '@angular/core';
import { CompilerService, EncodedACI } from '../compiler.service'
import { Contract } from '../contracts/hamster';
import { ContractControlService } from '../contract-control.service';
import { ContractBase } from '../question/contract-base';
import { Subscription } from 'rxjs';
import { getNumberOfCurrencyDigits } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, ResolveStart } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {SuiModalService, TemplateModalConfig, ModalTemplate} from 'ng2-semantic-ui';
import { ClipboardService } from 'ngx-clipboard'




@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']/* ,
  providers: [ CompilerService ] */
})
export class EditorComponent implements OnInit {
  
  isDimmed: boolean = false;
  //Fires when the SDK does something
  editorAction: Subscription;

  editorInstance: any; // the editor, initialized by the component

  highlightedRows: any = []; // the rows to highlight (when opening a shared contract)

  // debug - multiple instances running, or same code two times?
  runTimes: number = 0;

  // set the editor's style:
  //@HostBinding('attr.class') css = 'ui segment container';

  @HostBinding('style.border') value = 'red';

  // listen to compiler events asking to send code
  subscription: Subscription;

  // note if this editor is currently in active tab
  isActiveTab : boolean = true;

  // import default contract, after that set this with editor's content

  //the current active code - initialized either as default code, or code fetched from DB, later on set by editor content
  // INITIALIZATION RACE DEBUGGING contract: Contract<string>
  contract: any;

  constructor(private compiler: CompilerService, 
    private _router: Router, 
    private _route: ActivatedRoute, 
    private http: HttpClient,
    private _clipboardService: ClipboardService,
    private changeDetectorRef: ChangeDetectorRef) { 
   // get code if param is there

    // get URL parameters 
   

    // activate this line to override trying to fetch a contract from backend
   //this.contract = new Contract();
  }

  editorOptions = {theme: 'vs-dark', 
    language: 'aes', 
    cursorBlinking: 'phase', 
    cursorSmoothCaretAnimation:'true',
    renderIndentGuides:'true',
  contextmenu:'true'};

  ngOnInit() {
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

      let contractID = parameter.get("contract");
      console.log("contract ID: ", contractID);

      // get contract ID from URl parameter for fetching code from DB
      if(parameter.get("contract") !== null) {
        let contractID = parameter.get("contract");
        console.log("contract ID: ", contractID);
        // call backend
        let requestURL = `${environment.contractSharingBackend}${contractID}`
        console.log("Die request URL ist: ", requestURL);

        //let something = this.http.get(`https://xfs2awe868.execute-api.eu-central-1.amazonaws.com/dev/candidates/9702aa10-b`)

        this.http.get(`${environment.contractSharingBackend}${contractID}`).subscribe((res) => {
          // if the backend responds, initialize a new contract with the code from the backend. 
          // if there is no contract in the response, initialize the default contract
          // TODO: Show a message is a contract was tried to be fetched that doesnt exist anymore 
          //console.log("is it there? ", res['contract'])
          res['contract'] !== undefined ? this.contract = new Contract(res['contract']) : this.contract = new Contract();
          // next two commands are a workaround for some stupid race condition that leaves the default contract in place
          this.compiler.code = '';
          this.compiler.generateACIonly(this.contract.code);
          this.compiler.code = this.contract.code;
          this.compiler.generateACIonly(this.contract.code);

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
          console.log("No contract ID found, initializing the default one.");
          this.contract = new Contract();
          this.compiler.generateACIonly(this.contract.code);
        }
      }
    });

    // If the compiler asks for code, give it to him and deploy the contract
    this.subscription = this.compiler._fetchActiveCode
      .subscribe(item => {console.log("Im editor angekommen !"); 
      //console.log("Current code ist: ", this.contract.code)
       // fix stupid race condition displaying default contract even if one is fetched from DB 
      //this.contract.code= ''
      
      this.compiler.generateACIonly(this.contract.code);
    // Beim start schon copilen oder nicht ?
    //  return this.compile();


  }); 
  }

  // initializes editor object to interact with - called by the editor component
  initializeEditorObject(theEditor: monaco.editor.IStandaloneCodeEditor){
    //console.log("The editor:", theEditor._actions["editor.foldAll"]._run());
    console.log("The editor:", theEditor);
    this.editorInstance = theEditor;
    // test code background highlighting
    // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
    if (this.highlightedRows.length > 3) {let rows = this.highlightedRows;
      this.editorInstance.deltaDecorations([], [
        { range: new monaco.Range(rows[0],rows[1],rows[2],rows[3]), options: { inlineClassName: 'problematicCodeLine' }},
      ]);}


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
      let postData = {"contract":this.contract.code ,"contractName": "some", "editorVersion":1}
      console.log("So sieht post data aus:", postData);

      this.http.post(environment.contractSharingBackend, postData, {
        headers: new HttpHeaders({
             'Content-Type':  'application/json',
           })
      }).subscribe(data=>{
         console.log("Post hat ergeben?", data)

         let s = this.compiler.activeCodeSelection
         let constructedUrl = `http://localhost:4200/?highlight=${s.endLineNumber}-${s.endColumn}-${s.startLineNumber}-${s.startColumn}&contract=${data['candidateId']}`
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

  change(){
    //console.log("Shit done changed!");
    // put the active code into compiler
    this.compiler.makeCompilerAskForCode(0);
  console.log("code ist gerade: ",this.contract.code);
    // generate some ACI just to display init() function for deployment
    this.compiler.generateACIonly(this.contract.code);
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.subscription.unsubscribe();
  }
}
