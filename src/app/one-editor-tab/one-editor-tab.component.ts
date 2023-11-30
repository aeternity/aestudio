import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { CompilerService } from '../compiler.service';
import { Contract } from '../contracts/hamster';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription, Subject } from 'rxjs';
import { setInterval, clearInterval } from 'timers';
import { AuthService } from '../services/auth/auth.service';
import { StateService } from '../services/state.service';
import { IActiveContract } from '../helpers/interfaces';
import { BreakpointEnum, BreakpointEvents, CursorPositionChangedEvent, Disposable, EditorMouseEvent, EditorMouseTarget, ModelDecoration, ModelDecorationOptions, ModelDeltaDecoration, Position } from './editorTypes';

import { EventEmitter as dbgEvent } from './eventEmitter';
import { CursorChangeReason, MouseTargetType } from './dataTypes';


export const BREAKPOINT_OPTIONS: ModelDecorationOptions = {
	glyphMarginClassName: 'monaco-breakpoint',
};
 
const BREAKPOINT_HOVER_OPTIONS: ModelDecorationOptions = {
	glyphMarginClassName: 'monaco-hover-breakpoint',
};

export const HIGHLIGHT_OPTIONS: ModelDecorationOptions = {
	isWholeLine: true,
	className: 'monaco-line-highlight',
}

export type Handler<T = any> = (data: T) => void;

@Component({
  selector: 'app-one-editor-tab',
  templateUrl: './one-editor-tab.component.html',
  styleUrls: ['./one-editor-tab.component.css']
})
export class OneEditorTabComponent implements OnInit, OnDestroy {

  // angular 9 bullshit start
  codeGeneratorVisible: boolean = false
  closeCodeEditor() {}
  generatedCode:any = false
  // angular 9 bullshit end

  //debugger start
  editor: any = null;
  private preLineCount = 0;
	private hoverDecorationId = '';
	private highlightDecorationId = '';

	private eventEmitter = new dbgEvent();
	
	private isUndoing = false;
	private isLineCountChanged = false;
	private lineContent: string | null = null;

	private mouseMoveDisposable: Disposable | null = null;
	private mouseDownDisposable: Disposable | null = null;
	private contentChangedDisposable: Disposable | null = null;
	private cursorPositionChangedDisposable: Disposable | null = null;

	private decorationIdAndRangeMap = new Map<string, Range>();
	private lineNumberAndDecorationIdMap = new Map<number, string>();
  currentBreakpointLines : number[] = []; // set by getBreakpoints() which is rerun by any code change
  //debugger end


  //the contract passed by the parent editor component
  @Input() activeContract: IActiveContract;
  @Input() test: number;
  @Output() activeContractChange = new EventEmitter<any>();

  // dimming for sharing link displaying
  isDimmed: boolean = false;
  contractID : string | boolean = false // necessary for the link copying dimming

  editorInstance: monaco.editor.IStandaloneCodeEditor; // the editor, initialized by the component
  
  // workaround for annoying angular bug firing events dozens of times: collect hashes of errors in this map and set new ones only if hash is unused 
  lastError: string;
  currentDecorations: any;

  // ----- subscriptions start 

  // Listen to compilation success (e.g. to remove highlights)
  rawACIsubscription: Subscription;

  // listen for new errors
  newErrorSubscription: Subscription;

  // for throttled access to compiler
  codeChanged: Subject<string> = new Subject<string>();

  // this contract's ACI
  public aci : object = {};
  // Declaring the Promise, yes! Promise!
  filtersLoaded: Promise<boolean>;

  // ----- subscriptions end

  saveChangesOnFirstAci: any;

  throttledChange(){
    this.codeChanged.next();
    this.activeContractChange.emit(this.activeContract);
    this.save();

  }
  

  editorOptions : monaco.editor.IEditorOptions = {
  //theme: 'vs-dark', 
  //@ts-ignore
  language: 'aes', 
  cursorBlinking: 'phase', 
  cursorSmoothCaretAnimation: 'on',
  //renderIndentGuides:'true',
  contextmenu: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  smoothScrolling: true,
  glyphMargin: true
};

generatedCodeEditorOptions = {theme: 'vs-dark', 
  language: 'javascript', 
  cursorBlinking: 'phase', 
  cursorSmoothCaretAnimation:'true',
  renderIndentGuides:'true',
  contextmenu:'false',
  minimap:'false'};
  
  constructor(
    private compiler: CompilerService,
    private http: HttpClient,
    private _clipboardService: ClipboardService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    public state: StateService 
  ) {
    console.log("activeContract", this.activeContract);
    
    this.setupThrottledCompilerRequests();
    this.save();

   }

  ngOnInit() {
    console.log("activeContract", this.activeContract);
    this.setupCodeSharingHighlighters();
    this.setupErrorHighlighting();
    //this.setupACIsubscription();
    this.change();
    this.save();
 
    //this.editorInstance.onKeyDown(handlerTest)
  
    this.compiler._newACI.subscribe(item => {
      
      console.log(">>> ACI subscription returned: ", item);
    
      if (Object.entries(item['aci']).length > 0 && item['contractUID'] == this.activeContract.contractUID) {
        
        //this.filtersLoaded = Promise.resolve(true);
        // save the latest ACI to display the contract's name in tabs and maybe other neat features later, but maybe not store it in cloud later.
        this.activeContract.latestACI = item['aci'];
        
        console.log("[one-editor-tab] New change received for contract: ", item['contractUID']);
        
        this.save();
        
        this.changeDetectorRef.detectChanges()
        //console.log("Aci im one editor", this.activeContract.latestACI)
        //console.log("Clearing error marker..");
        this.clearAllHighlighters();
        
        // reset the error tracker
        //console.log("Resetting last known error..");
        this.lastError = "";} else if (item['error'] != null && item['contractUID'] == this.activeContract.contractUID) {
          
          let theError = item['error'];
          console.log("Error erhalten für" + this.activeContract.contractUID, theError);
          
        } else {
          //console.log("Empty or other contract's ACI was received, not removing error");
        }
    })
        
  }

  ngOnDestroy(): void {
    this.compiler._newACI.unsubscribe();
  }
  
  aciSubscription(){
    this.rawACIsubscription = this.compiler._notifyCompiledAndACI
    .subscribe(item => { console.log("Neue ACI für init ist da !", item) 

    console.log(">>> ACI subscription returned: ", item);
 
  if (Object.entries(item['aci']).length > 0 && item['contractUID'] == this.activeContract.contractUID) {
    
    //this.filtersLoaded = Promise.resolve(true);
    // save the latest ACI to display the contract's name in tabs and maybe other neat features later, but maybe not store it in cloud later.
    this.activeContract.latestACI = item['aci'].contract;
    
    console.log("[one-editor-tab] New change received for contract: ", item['contractUID']);
    
    this.activeContract.latestACI;
    this.save();
    
    //this.changeDetectorRef.detectChanges()
    console.log("Aci im one editor", this.activeContract.latestACI)
    //console.log("Clearing error marker..");
    this.clearAllHighlighters();
    
    // reset the error tracker
    //console.log("Resetting last known error..");
    this.lastError = "";} else if (item['error'] != null && item['contractUID'] == this.activeContract.contractUID) {
      
      let theError = item['error'];
      console.log("Error erhalten für" + this.activeContract.contractUID, theError);
    } else {
      //console.log("Empty or other contract's ACI was received, not removing error");
    }
  })}


  change(){
    //console.log("Shit done changed!");
    
    // hier ists doppelt gemoppelt: next line callt nur "generate aci only"
    //this.compiler.makeCompilerAskForCode(this.activeContract.contractUID);

    //console.log("code ist gerade: ",this.activeContract.code);
    
    /* // report changed code to parent component (so it can save it etc..)
    this.save()    */ 

    // generate some ACI just to display init() function for deployment
    this.compiler.generateACIonly({sourceCode: this.activeContract.code, contractUID: this.activeContract.contractUID });
  }
  
  initializeEditorObject(theEditor: monaco.editor.IStandaloneCodeEditor){
    //console.log("The editor:", theEditor._actions["editor.foldAll"]._run());
    //console.log("The editor:", theEditor);
    this.editorInstance = theEditor;

    // debugger start
    this.editor = theEditor 
console.log('Editor:', this.editor)
		this.initMouseEvent();
		this.initEditorEvent();

    // debugger end


    this.triggerWindowRefresh(); 

    // highlight background of shared code
    // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
    if (this.activeContract.sharingHighlighters.length > 3) {let rows = this.activeContract.sharingHighlighters;
      setTimeout(() => {
        this.editorInstance.deltaDecorations([], [
          { range: new monaco.Range(rows[0],rows[1],rows[2],rows[3]), 
            options: { inlineClassName: 'problematicCodeLine'}},
        ])
      }, 300);
      ;}


    // custom context menu options

    // contract sharing feature - deactivated for now
    
/*     this.editorInstance.addAction ({
        // ID of the group in which the new item will appear.
        contextMenuGroupId: '1_modification',
        // there are three of them: 1 - 'navigation', 2 - '1_modification', 3 - '9_cutcopypaste';
        // you can create your own
        contextMenuOrder: 3, // order of a menu item within a group
        label: '<i class="share alternate icon"></i> Share contract and selection...',
        id: 'showDiff',
        // precondition: false, 
        keybindings: [], // Hotkeys
        // function called when clicking
        // press the specified keys
          run: async () => {
            let contractID = await this.authService.storeContractShare(this.activeContract.code);

            var constructedUrl;
            var s = this.compiler.activeCodeSelection || "";
            
            // share code with our without highlighter
            if (s.endLineNumber != undefined){
              constructedUrl = `${environment.appUrl}?highlight=${s.endLineNumber}-${s.endColumn}-${s.startLineNumber}-${s.startColumn}&contract=${contractID}`
            } else {
              constructedUrl = `${environment.appUrl}?contract=${contractID}`
            }
            
            console.log("DIE URL: ", constructedUrl)

            if(contractID !== false) {
              this._clipboardService.copyFromContent(constructedUrl);
              this.contractID = String(contractID)
            } 

            // display success message ;)
            this.isDimmed = true;
            // tell angular to detect changes because we're in a event subscription here -.-
            this.changeDetectorRef.detectChanges()
              setTimeout(() => {
                this.isDimmed = false;
                this.changeDetectorRef.detectChanges()
                this.contractID = false
              }, 1200);
          }
      });
 */

    // when right-clicking
    /* this.editorInstance.onContextMenu(function (e) {
      console.log("Läuft?", e)
    }); */

    // when selecting code
    this.editorInstance.onDidChangeCursorSelection( (result) => {
      // log selection coordinates only if it's actually a selection, not just a click.
      if (result.selection.endColumn != result.selection.startColumn && result.selection.startLineNumber != result.selection.endLineNumber) {
          this.compiler.activeCodeSelection = result.selection;
          //console.log("selected: ", result.selection);
          }
    });

    // when moving mouse lol
    /* this.editorAction = theEditor.onDidChangeCursorPosition
        .subscribe(async peng => {
          console.log(peng);
        }) */
  }

  // helpers:

  setupThrottledCompilerRequests(){
    // This throttles the requests to the compiler, so not always one is sent once a user types a key, but is delayed a little.
    this.codeChanged.pipe(
      debounceTime(environment.compilerRequestDelay) // wait 1 sec after the last event before emitting last event
      ). // only emit if value is different from previous value
      subscribe(something => {
        console.log(">>> Compiler call throttler let code 'change' pass")
        // Call your function which calls API or do anything you would like do after a lag of 1 sec
        this.change();
       });
  }
  
  setupErrorHighlighting(){
     // if the compiler / debugger submitts errors, highlight them:
     this.newErrorSubscription = this.compiler._notifyCodeError.pipe(
      // handle repetitive compiler errors
      distinctUntilChanged()
    )
      .subscribe(async error =>  {
          await error;
          
          //let theError = error.__zone_symbol__value;
          console.log(`Nur error, in ${this.activeContract.nameInTab} : , ${error}`);
        
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
              let errorHighlights = [
                // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
              { range: new monaco.Range(error.pos.line,
                                      error.pos.col +1,
                                      error.pos.line,
                                      error.pos.col), options: { inlineClassName: 'errorMarker', marginClassName: 'problematicCodeLine' }},
              ]
              // save error highlights to contract object 
              this.activeContract.errorHighlights = errorHighlights;
              this.save(); // like this ? 
              this.currentDecorations = this.editorInstance.deltaDecorations([], errorHighlights)
            } catch(e){
              console.log("tried adding highlights...")
            }

            //this.removeDuplicates("errorMarker");

          } else {
            //console.log("tried adding known error.")
          }
          //this.removeDuplicates("errorMarker");
      })  

  }

  // clear highlighters (todo: by identifier)
  clearAllHighlighters(){
    //clear all existing
    try{        
      this.currentDecorations = this.editorInstance.deltaDecorations(this.currentDecorations, [])
      this.activeContract.errorHighlights = [];
      this.activeContractChange.emit(this.activeContract);
    } catch(e){
    }
    
  }

  setupCodeSharingHighlighters(){
    // add the highlighter
    console.log("one-editor-tab activeContract", this.activeContract)
    if (this.activeContract.sharingHighlighters.length > 3) {
      let rows = this.activeContract.sharingHighlighters;
      this.editorInstance.deltaDecorations([], [
        { range: new monaco.Range(rows[0],rows[1],rows[2],rows[3]), options: { inlineClassName: 'problematicCodeLine' }},
      ]);}
  }

  setupACIsubscription(){
      // fires when contract got compiled or there was an error
  this.rawACIsubscription = this.compiler._notifyCompiledAndACI
  .subscribe(item => { 

    console.log(">>> ACI subscription returned: ", item);
 
  if (Object.entries(item['aci']).length > 0 && item['contractUID'] == this.activeContract.contractUID) {
    
    //this.filtersLoaded = Promise.resolve(true);
    // save the latest ACI to display the contract's name in tabs and maybe other neat features later, but maybe not store it in cloud later.
    this.activeContract.latestACI = item['aci'].contract;
    
    console.log("[one-editor-tab] New change received for contract: ", item['contractUID']);
    
    this.save();
    this.activeContract.latestACI;
    
    //this.changeDetectorRef.detectChanges()
    console.log("Aci im one editor", this.activeContract.latestACI)
    //console.log("Clearing error marker..");
    this.clearAllHighlighters();
    
    // reset the error tracker
    //console.log("Resetting last known error..");
    this.lastError = "";} else if (item['error'] != null && item['contractUID'] == this.activeContract.contractUID) {
      
      let theError = item['error'];
      console.log("Error erhalten für" + this.activeContract.contractUID, theError);

         // add new highlighter
         try{
          let errorHighlights = [
            // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
          { range: new monaco.Range(theError.pos.line,
                                  theError.pos.col +1,
                                  theError.pos.line,
                                  theError.pos.col), options: { inlineClassName: 'errorMarker', marginClassName: 'problematicCodeLine' }},
          ]
          // save error highlights to contract object 
          this.activeContract.errorHighlights = errorHighlights;
          this.save(); // like this ? 
          this.currentDecorations = this.editorInstance.deltaDecorations([], errorHighlights)
        } catch(e){
          console.log("tried adding highlights, but failed, for: ", this.activeContract.contractUID)
        }


    } else {
      //console.log("Empty or other contract's ACI was received, not removing error");
    }
  });
  }

  // alias to emit contract change
  save(){
    this.activeContractChange.emit(this.activeContract);
  }

  triggerWindowRefresh(millisecondsDelay?: number) {
    setTimeout(() => {
      var el = document; // This can be your element on which to trigger the event
      var event = document.createEvent('HTMLEvents');
      event.initEvent('resize', true, false);
      el.dispatchEvent(event)
    }, millisecondsDelay || 55)
  }

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



// debugger start
private initMouseEvent() {
  this.mouseMoveDisposable?.dispose();
  this.mouseMoveDisposable = this.editor!.onMouseMove(
    (e: EditorMouseEvent) => {
      const model = this.getModel();
      const { range, detail, type } = this.getMouseEventTarget(e);
      
      // This indicates that the current position of the mouse is over the total number of lines in the editor
      if (detail?.isAfterLines) {
        this.removeHoverDecoration();
        return;
      }
      
      //debugger
      // @ts-ignore
      if (model && type === MouseTargetType.GUTTER_GLYPH_MARGIN) {
        // remove previous hover breakpoint decoration
        this.removeHoverDecoration();
        
        // create new hover breakpoint decoration
        const newDecoration = this.createBreakpointDecoration(
          // @ts-ignore
          range,
          BreakpointEnum.Hover
          );
          // render decoration

          const decorationIds = this.editorInstance.deltaDecorations(
            [],
            [newDecoration]
            );


        // record the hover decoraion id
        this.hoverDecorationId = decorationIds[0];
      } else {
        this.removeHoverDecoration();
      }
    }
  );

  this.mouseDownDisposable?.dispose();
  this.mouseDownDisposable = this.editor!.onMouseDown(
    (e: EditorMouseEvent) => {
      const model = this.getModel();
      const { type, range, detail, position } = this.getMouseEventTarget(e);
      // @ts-ignore
      if (model && type === MouseTargetType.GUTTER_GLYPH_MARGIN) {
        // This indicates that the current position of the mouse is over the total number of lines in the editor
        if (detail.isAfterLines) {
          return;
        }

        const lineNumber = position.lineNumber;
        const decorationId =
          this.lineNumberAndDecorationIdMap.get(lineNumber);

        /**
         * If a breakpoint exists on the current line,
         * it indicates that the current action is to remove the breakpoint
         */
        if (decorationId) {
          this.removeSpecificDecoration(decorationId, lineNumber);
        } else {
          //@ts-ignore
          this.createSpecificDecoration(range);
        }
      }
    }
  );
}

private getModel() {
  return this.editor?.getModel();
}

private getMouseEventTarget(e: EditorMouseEvent) {
  return { ...(e.target as EditorMouseTarget) };
}

private removeHoverDecoration() {
  const model = this.getModel();

  if (model && this.hoverDecorationId) {
    model.deltaDecorations([this.hoverDecorationId], []);
  }
  this.hoverDecorationId = '';
}

private createBreakpointDecoration(range: Range, breakpointEnum: BreakpointEnum): ModelDeltaDecoration {
  return {
    // @ts-ignore
    range,
    options:
      breakpointEnum === BreakpointEnum.Exist
        ? BREAKPOINT_OPTIONS
        : BREAKPOINT_HOVER_OPTIONS,
  };
}

private removeSpecificDecoration(decorationId: string, lineNumber: number) {
  const model = this.getModel();
  model?.deltaDecorations([decorationId], []);
  this.decorationIdAndRangeMap.delete(decorationId);
  this.lineNumberAndDecorationIdMap.delete(lineNumber);
  this.emitBreakpointChanged();
}

private createSpecificDecoration(range: Range) {
  const model = this.getModel();

  if (model) {
    /**
     * If no breakpoint exists on the current line,
     * it indicates that the current action is to add a breakpoint.
     * create breakpoint decoration
     */
    const newDecoration = this.createBreakpointDecoration(
      range,
      BreakpointEnum.Exist
    );
    // render decoration
    const newDecorationId = model.deltaDecorations(
      [],
      [newDecoration]
    )[0];

    // record the new breakpoint decoration id
    this.lineNumberAndDecorationIdMap.set(
      // @ts-ignore
      range.endLineNumber,
      newDecorationId
    );
    this.emitBreakpointChanged();

    // record the new decoration
    const decoration = this.getLineDecoration(
      // @ts-ignore
      range.endLineNumber
      );

    if (decoration) {
      this.decorationIdAndRangeMap.set(newDecorationId, decoration.range);
    }
  }
}

private emitBreakpointChanged() {
  this.getBreakpoints();

  //this.emit('breakpointChanged', this.getBreakpoints());
  //TODO: put subscription here to inform other components about breakpoint changes
}

private emit<T extends keyof BreakpointEvents>(event: T, data: BreakpointEvents[T]) {
  this.eventEmitter.emit(event, data);
}
private getLineDecoration(lineNumber: number) {
  return (
    this.getModel()
      ?.getLineDecorations(lineNumber)
      ?.filter(
        (decoration) =>
          decoration.options.glyphMarginClassName ===
          BREAKPOINT_OPTIONS.glyphMarginClassName
      )?.[0] ?? null
  );
}

getBreakpoints() {
  const breakpoints: number[] = [];

  for (let [lineNumber, _] of this.lineNumberAndDecorationIdMap) {
    breakpoints.push(lineNumber);
  }
  this.currentBreakpointLines = breakpoints;
  return breakpoints;
}


private initEditorEvent() {
  this.preLineCount = this.getLineCount();

  // Execute onDidChangeModelContent callback first
  this.contentChangedDisposable?.dispose();
  this.contentChangedDisposable = this.editor!.onDidChangeModelContent((e) => {
    const curLineCount = this.getLineCount();

    this.isUndoing = e.isUndoing;
    this.isLineCountChanged = curLineCount !== this.preLineCount;
    this.preLineCount = curLineCount;
  });

  // Execute onDidChangeCursorPosition callback second
  this.cursorPositionChangedDisposable?.dispose();
  this.cursorPositionChangedDisposable = this.editor!.onDidChangeCursorPosition(e => {
    const model = this.getModel();
    const decorations = this.getAllDecorations();

    if (model && this.isLineCountChanged) {
      for (let decoration of decorations) {
        const curRange = decoration.range;
        const preRange = this.decorationIdAndRangeMap.get(decoration.id);

        const isPaste = e.reason === CursorChangeReason.Paste;
        // vscode breakpoint logic
        const needRenderDecorationInEndLineNumber =
          !isPaste &&
          this.isUndoing &&
          curRange.startLineNumber !== curRange.endLineNumber

        if (!this.isUndoing || needRenderDecorationInEndLineNumber) {
          /**
           * if startLineNumber equals to endLineNumber,
           * only need to update the record map (decorationIdAndRangeMap & lineNumberAndDecorationIdMap)
           */
          if (curRange.startLineNumber === curRange.endLineNumber) {
            this.replaceSpecifyLineNumberAndIdMap(curRange, decoration);
          } else if (preRange) {
            const lineBreakInHead = this.checkIfLineBreakInHead(e, curRange, preRange);

            // remove old decoration before re render the new breakpoint decoration
            // @ts-ignore
            this.removeSpecificDecoration(decoration.id, preRange.startLineNumber);
            /**
             * if line break in head, render the breakpoint decoration in endLineNumber,
             * if current line has breakpoint decoration & isUndoing & not paste & cur startLineNumber & cur endLineNumber
             * else render in startLineNumber
             */
            this.createSpecificDecoration({
              ...curRange,
              ...(lineBreakInHead || needRenderDecorationInEndLineNumber ? {
                startLineNumber: curRange.endLineNumber,
                endColumn: model.getLineLength(curRange.endLineNumber) + 1
              } : {
                endLineNumber: curRange.startLineNumber,
                endColumn: model.getLineLength(curRange.startLineNumber) + 1
              })
            });
          }
        } else if (curRange.startLineNumber === curRange.endLineNumber) {
          this.replaceSpecifyLineNumberAndIdMap(curRange, decoration);
        }
      }
    } else {
      /**
       * there is no line break and startLineNumber equals to endLineNumber,
       * only need to update the record map (decorationIdAndRangeMap & lineNumberAndDecorationIdMap)
       */
      for (let decoration of decorations) {
        this.decorationIdAndRangeMap.set(decoration.id, decoration.range);
      }
    }

    /**
     * remove extra decoration which not in
     */
    this.removeExtraDecoration();

    /**
     * reset isUndoing && isLineCountChanged status
     */
    this.isUndoing = false;
    this.isLineCountChanged = false;
    /**
     * In order to judge that the change of the code starts from the beginning of the line,
     * record the text of the line where the current cursor is located
     */
    this.lineContent = this.getLineContentAtPosition(e.position);
  });
}

private getLineCount() {
  return this.getModel()?.getLineCount() ?? 0;
}

private getAllDecorations() {
  return (
    this.getModel()
      ?.getAllMarginDecorations()
      ?.filter(
        (decoration) =>
          decoration.options.glyphMarginClassName ===
          BREAKPOINT_OPTIONS.glyphMarginClassName
      ) ?? []
  );
}

private replaceSpecifyLineNumberAndIdMap(curRange: Range, decoration: ModelDecoration) {
  for (let [decorationId, range] of this.decorationIdAndRangeMap) {
    // remove duplicated range in map
    if (JSON.stringify(range) === JSON.stringify(decoration.range)) {
      this.decorationIdAndRangeMap.delete(decorationId);
      break;
    }
  }
  
  //@ts-ignore
  this.decorationIdAndRangeMap.set(decoration.id, decoration.range);

  for (let [lineNumber, decorationId] of this.lineNumberAndDecorationIdMap) {
    // remove duplicated range in map
    if (decorationId === decoration.id) {
      this.lineNumberAndDecorationIdMap.delete(lineNumber);
      break;
    }
  }

  //@ts-ignore
  this.lineNumberAndDecorationIdMap.set(curRange.startLineNumber, decoration.id);
  this.emitBreakpointChanged();
}

	/**
	 * @description when decoration changed, check if line break in head.
	 * @returns Boolean
	 */
	private checkIfLineBreakInHead(e: CursorPositionChangedEvent, curRange: Range, preRange: Range) {
		const { reason, position } = e;
		const isPaste = reason === CursorChangeReason.Paste;
		const lineContent = this.getLineContentAtPosition(position, false);

		let lineBreakInHead =
			!isPaste && 
      //@ts-ignore
			preRange.endColumn === curRange.endColumn &&
      //@ts-ignore
			preRange.startColumn === curRange.startColumn &&
      //@ts-ignore
			preRange.endLineNumber !== curRange.endLineNumber &&
      //@ts-ignore
			preRange.startLineNumber === curRange.startLineNumber;

		/**
		 * if pasted and lineContent in current cursor position equals to this.lineContent (preLineContent),
		 * indicate paste in pre lineContent head.
		 */
		if (isPaste && lineContent === this.lineContent) {
			lineBreakInHead = true;
		}

		return lineBreakInHead;
	}

  	/**
	 * Remove extra decoration after re render new breakpoint decoration,
	 * The purpose is to synchronize with decorationIdAndRangeMap & lineNumberAndDecorationIdMap
	 */
	private removeExtraDecoration() {
		const model = this.getModel();
		const decorations = this.getAllDecorations();

		for (let decoration of decorations) {
			if (!this.decorationIdAndRangeMap.has(decoration.id)) {
				model?.deltaDecorations([decoration.id], []);
			}
		}
	}

  	/**
	 * 
	 * @param position monaco.IPosition
	 * @param needFullContent if set true, return the full line content from column 1
	 * @returns 
	 */
	private getLineContentAtPosition(position: Position, needFullContent: boolean = true) {
		const model = this.getModel();

		if (model) {
			const { lineNumber, column } = position;

			return model.getValueInRange({
				startLineNumber: lineNumber,
				endLineNumber: lineNumber,
				startColumn: needFullContent ? 1 : column,
				endColumn: model.getLineLength(lineNumber) + 1
			}).trim();
		}
		return '';
	}

// debugger end
}