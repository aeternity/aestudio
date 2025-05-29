import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators';
import type Monaco from 'monaco-editor';

import { environment } from 'src/environments/environment';
import { CompilerService } from '../compiler.service';
import { HttpClient } from '@angular/common/http';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription, Subject } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { StateService } from '../services/state.service';
import { IActiveContract } from '../helpers/interfaces';

declare const monaco: typeof Monaco;

@Component({
  selector: 'app-one-editor-tab',
  templateUrl: './one-editor-tab.component.html',
  styleUrls: ['./one-editor-tab.component.css'],
})
export class OneEditorTabComponent implements OnInit, OnDestroy {
  // angular 9 bullshit start
  codeGeneratorVisible = false;
  generatedCode: any = false;
  // angular 9 bullshit end

  //the contract passed by the parent editor component
  @Input() activeContract: IActiveContract;
  @Input() test: number;
  @Output() activeContractChange = new EventEmitter<any>();

  // dimming for sharing link displaying
  isDimmed = false;
  contractID: string | boolean = false; // necessary for the link copying dimming

  editorInstance: Monaco.editor.IStandaloneCodeEditor; // the editor, initialized by the component

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
  public aci: object = {};
  // Declaring the Promise, yes! Promise!
  filtersLoaded: Promise<boolean>;

  // ----- subscriptions end

  saveChangesOnFirstAci: any;

  throttledChange() {
    this.codeChanged.next();
    this.activeContractChange.emit(this.activeContract);
    this.save();
  }

  editorOptions = {
    theme: 'vs-dark',
    language: 'aes',
    cursorBlinking: 'phase',
    cursorSmoothCaretAnimation: 'true',
    renderIndentGuides: 'true',
    contextmenu: 'true',
    scrollBeyondLastLine: 'false',
    automaticLayout: 'true',
    smoothScrolling: 'true',
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

  constructor(
    private compiler: CompilerService,
    private http: HttpClient,
    private _clipboardService: ClipboardService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    public state: StateService,
  ) {
    console.log('activeContract', this.activeContract);

    this.setupThrottledCompilerRequests();
    this.save();
  }

  ngOnInit() {
    console.log('activeContract', this.activeContract);
    this.setupCodeSharingHighlighters();
    this.setupErrorHighlighting();
    //this.setupACIsubscription();
    this.change();
    this.save();

    //this.editorInstance.onKeyDown(handlerTest)

    this.compiler._newACI.subscribe((item) => {
      console.log('>>> ACI subscription returned:', item);

      if (
        Object.entries(item['aci']).length > 0 &&
        item['contractUID'] == this.activeContract.contractUID
      ) {
        //this.filtersLoaded = Promise.resolve(true);
        // save the latest ACI to display the contract's name in tabs and maybe other neat features later, but maybe not store it in cloud later.
        this.activeContract.latestACI = item['aci'];

        console.log('[one-editor-tab] New change received for contract:', item['contractUID']);

        this.save();

        this.changeDetectorRef.detectChanges();
        //console.log("Aci im one editor", this.activeContract.latestACI)
        //console.log("Clearing error marker..");
        this.clearAllHighlighters();

        // reset the error tracker
        //console.log("Resetting last known error..");
        this.lastError = '';
      } else if (item['error'] != null && item['contractUID'] == this.activeContract.contractUID) {
        const theError = item['error'];
        console.log('Error erhalten für' + this.activeContract.contractUID, theError);
      } else {
        //console.log("Empty or other contract's ACI was received, not removing error");
      }
    });
  }

  ngOnDestroy(): void {
    this.compiler._newACI.unsubscribe();
  }

  aciSubscription() {
    this.rawACIsubscription = this.compiler._notifyCompiledAndACI.subscribe((item) => {
      console.log('Neue ACI für init ist da !', item);

      console.log('>>> ACI subscription returned:', item);

      if (
        Object.entries(item['aci']).length > 0 &&
        item['contractUID'] == this.activeContract.contractUID
      ) {
        //this.filtersLoaded = Promise.resolve(true);
        // save the latest ACI to display the contract's name in tabs and maybe other neat features later, but maybe not store it in cloud later.
        this.activeContract.latestACI = item['aci'].contract;

        console.log('[one-editor-tab] New change received for contract:', item['contractUID']);

        this.save();

        //this.changeDetectorRef.detectChanges()
        console.log('Aci im one editor', this.activeContract.latestACI);
        //console.log("Clearing error marker..");
        this.clearAllHighlighters();

        // reset the error tracker
        //console.log("Resetting last known error..");
        this.lastError = '';
      } else if (item['error'] != null && item['contractUID'] == this.activeContract.contractUID) {
        const theError = item['error'];
        console.log('Error erhalten für' + this.activeContract.contractUID, theError);
      } else {
        //console.log("Empty or other contract's ACI was received, not removing error");
      }
    });
  }

  change() {
    //console.log("Shit done changed!");

    // hier ists doppelt gemoppelt: next line callt nur "generate aci only"
    //this.compiler.makeCompilerAskForCode(this.activeContract.contractUID);

    //console.log("code ist gerade:",this.activeContract.code);

    /* // report changed code to parent component (so it can save it etc..)
    this.save()    */

    // generate some ACI just to display init() function for deployment
    this.compiler.generateACIonly({
      sourceCode: this.activeContract.code,
      contractUID: this.activeContract.contractUID,
    });
  }

  initializeEditorObject(theEditor: Monaco.editor.IStandaloneCodeEditor) {
    //console.log("The editor:", theEditor._actions["editor.foldAll"]._run());
    //console.log("The editor:", theEditor);
    this.editorInstance = theEditor;
    this.triggerWindowRefresh();

    // highlight background of shared code
    // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
    if (this.activeContract.sharingHighlighters.length > 3) {
      const rows = this.activeContract.sharingHighlighters;
      setTimeout(() => {
        this.editorInstance.deltaDecorations(
          [],
          [
            {
              range: new monaco.Range(rows[0], rows[1], rows[2], rows[3]),
              options: { inlineClassName: 'problematicCodeLine' },
            },
          ],
        );
      }, 300);
    }

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

            console.log("DIE URL:", constructedUrl)

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

  // helpers:

  setupThrottledCompilerRequests() {
    // This throttles the requests to the compiler, so not always one is sent once a user types a key, but is delayed a little.
    this.codeChanged
      .pipe(
        debounceTime(environment.compilerRequestDelay), // wait 1 sec after the last event before emitting last event
      ) // only emit if value is different from previous value
      .subscribe(() => {
        console.log(">>> Compiler call throttler let code 'change' pass");
        // Call your function which calls API or do anything you would like do after a lag of 1 sec
        this.change();
      });
  }

  setupErrorHighlighting() {
    // if the compiler / debugger submitts errors, highlight them:
    this.newErrorSubscription = this.compiler._notifyCodeError
      .pipe(
        // handle repetitive compiler errors
        distinctUntilChanged(),
      )
      .subscribe(async (error) => {
        await error;

        //let theError = error.__zone_symbol__value;
        console.log(`Nur error, in ${this.activeContract.nameInTab} : , ${error}`);

        // workaround for stupid angular bug calling events dozens of times: hash error in check if it was there already or not
        const errorHash = this.hash(error);
        //console.log("Error hash:", errorHash)
        // if angular isn't trying to report the already known error again...
        if (errorHash != this.lastError) {
          this.lastError = errorHash; // mark error as used

          // remove highlights the soft way...
          this.clearAllHighlighters();

          // add new highlighter
          try {
            const errorHighlights = [
              // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
              {
                range: new monaco.Range(
                  error.pos.line,
                  error.pos.col + 1,
                  error.pos.line,
                  error.pos.col,
                ),
                options: { inlineClassName: 'errorMarker', marginClassName: 'problematicCodeLine' },
              },
            ];
            // save error highlights to contract object
            this.activeContract.errorHighlights = errorHighlights;
            this.save(); // like this ?
            this.currentDecorations = this.editorInstance.deltaDecorations([], errorHighlights);
          } catch {
            console.log('tried adding highlights...');
          }

          //this.removeDuplicates("errorMarker");
        } else {
          //console.log("tried adding known error.")
        }
        //this.removeDuplicates("errorMarker");
      });
  }

  // clear highlighters (todo: by identifier)
  clearAllHighlighters() {
    //clear all existing
    try {
      this.currentDecorations = this.editorInstance.deltaDecorations(this.currentDecorations, []);
      this.activeContract.errorHighlights = [];
      this.activeContractChange.emit(this.activeContract);
      // eslint-disable-next-line no-empty
    } catch {}
  }

  setupCodeSharingHighlighters() {
    // add the highlighter
    console.log('one-editor-tab activeContract', this.activeContract);
    if (this.activeContract.sharingHighlighters.length > 3) {
      const rows = this.activeContract.sharingHighlighters;
      this.editorInstance.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(rows[0], rows[1], rows[2], rows[3]),
            options: { inlineClassName: 'problematicCodeLine' },
          },
        ],
      );
    }
  }

  setupACIsubscription() {
    // fires when contract got compiled or there was an error
    this.rawACIsubscription = this.compiler._notifyCompiledAndACI.subscribe((item) => {
      console.log('>>> ACI subscription returned:', item);

      if (
        Object.entries(item['aci']).length > 0 &&
        item['contractUID'] == this.activeContract.contractUID
      ) {
        //this.filtersLoaded = Promise.resolve(true);
        // save the latest ACI to display the contract's name in tabs and maybe other neat features later, but maybe not store it in cloud later.
        this.activeContract.latestACI = item['aci'].contract;

        console.log('[one-editor-tab] New change received for contract:', item['contractUID']);

        this.save();

        //this.changeDetectorRef.detectChanges()
        console.log('Aci im one editor', this.activeContract.latestACI);
        //console.log("Clearing error marker..");
        this.clearAllHighlighters();

        // reset the error tracker
        //console.log("Resetting last known error..");
        this.lastError = '';
      } else if (item['error'] != null && item['contractUID'] == this.activeContract.contractUID) {
        const theError = item['error'];
        console.log('Error erhalten für' + this.activeContract.contractUID, theError);

        // add new highlighter
        try {
          const errorHighlights = [
            // Range (54,38,5,3) means: endline, endcolumn, startline, startcolumn
            {
              range: new monaco.Range(
                theError.pos.line,
                theError.pos.col + 1,
                theError.pos.line,
                theError.pos.col,
              ),
              options: { inlineClassName: 'errorMarker', marginClassName: 'problematicCodeLine' },
            },
          ];
          // save error highlights to contract object
          this.activeContract.errorHighlights = errorHighlights;
          this.save(); // like this ?
          this.currentDecorations = this.editorInstance.deltaDecorations([], errorHighlights);
        } catch {
          console.log('tried adding highlights, but failed, for:', this.activeContract.contractUID);
        }
      } else {
        //console.log("Empty or other contract's ACI was received, not removing error");
      }
    });
  }

  // alias to emit contract change
  save() {
    this.activeContractChange.emit(this.activeContract);
  }

  triggerWindowRefresh(millisecondsDelay?: number) {
    setTimeout(() => {
      const el = document; // This can be your element on which to trigger the event
      const event = document.createEvent('HTMLEvents');
      event.initEvent('resize', true, false);
      el.dispatchEvent(event);
    }, millisecondsDelay || 55);
  }

  hash = function hashCode(o, l?) {
    o = this.sortObjectKeys(o);
    l = l || 2;
    let i, c;
    const r = [];
    for (i = 0; i < l; i++) r.push(i * 268803292);
    function stringify(o) {
      let i, r;
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
}
