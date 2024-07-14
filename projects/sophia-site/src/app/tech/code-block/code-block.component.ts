//import typings for monaco editor
/// <reference path="../../../../../../node_modules/monaco-editor/monaco.d.ts" /> 

import { Component, Injector, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { SuiModule } from 'ngx-ng2-semantic-ui';
import { examples, SophiaCodeExample } from '../examples';
import { CodeBlockWrapperComponent } from "../code-block-wrapper/code-block-wrapper.component";
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssChevronRight } from '@ng-icons/css.gg';
import { bootstrapPlayFill } from '@ng-icons/bootstrap-icons';
import { cssSync } from '@ng-icons/css.gg';
import { ReplServiceService } from '../repl-service.service';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule, MonacoEditorModule, FormsModule, SuiModule, CodeBlockWrapperComponent, NgIconComponent],
  providers: [ReplServiceService, provideIcons({ cssChevronRight, cssSync, bootstrapPlayFill })],
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.scss']
})

export class CodeBlockComponent implements OnInit {
  @Input() exampleCode: string;
  @Input() exampleID: string;
  @Input() tryItYourselfCode: string; // fetch from the examples json file
  
  userCommand: string 
  mainContract: string;
  @Output() resetButtonClicked = new EventEmitter<void>();
  
  container : Element;
  editor: monaco.editor.IStandaloneCodeEditor
  examples : SophiaCodeExample = examples;

  collapseResults: boolean = true;

  replOutputs: string[] = []
  replInstance : ReplServiceService | null = null;
  // replInstance: 

  // @ViewChildren('.editor-container', { read: ElementRef }) container: QueryList<ElementRef>;
  // container = document.getElementBy('container'); // for dynamic editor height

  // idea: simulate terminal effect with monaco editor's cursorWidth option
  readOnlyEditorOptions = {
    theme: 'vs-dark', 
    language: 'aes', 
    cursorBlinking: 'phase', 
    cursorSmoothCaretAnimation:'true',
    renderIndentGuides:'true',
    contextmenu:'true',
    scrollBeyondLastLine: 'false',
    // automaticLayout: "true",
    smoothScrolling: 'true',
    readOnly: true,
    minimap: {enabled: false}
}

  tryItYourselfEditorOptions = {
    theme: 'vs-dark', 
    language: 'aes', 
    cursorBlinking: 'phase', 
    cursorSmoothCaretAnimation:'true',
    renderIndentGuides:'true',
    contextmenu:'true',
    scrollBeyondLastLine: 'false',
    // automaticLayout: "true",
    smoothScrolling: 'true',
    readOnly: false,
    minimap: {enabled: false}
}

  active: boolean = true;



constructor(private elRef: ElementRef, private injector: Injector) { 
  // this.tryItYourselfCode = this.examples[this.exampleID]?.tryItYourselfCode[0]
  // this.examples[this.exampleID]?.tryItYourselfCode[0]
  // debugger
}


ngAfterViewInit() {
    this.container = this.elRef.nativeElement.querySelector('.editor-container');
  
}

updateHeight = () => {

  // using this trick to adjust the height to the code content, no updating of the height is needed as the content doesn't change.
  // https://microsoft.github.io/monaco-editor/playground.html?source=v0.36.0-dev.20230221#XQAAAAJlAwAAAAAAAABBqQkHQ5NjdMjwa-jY7SIQ9S7DNlzs5W-mwj0fe1ZCDRFc9ws9XQE0SJE1jc2VKxhaLFIw9vEWSxW3yscw5mjaUk9VGmxoyTzHe8U3Wtpjsr3iuTGKtlMfj1i13U-2gw_GQSp0kweizye4hh9kXqlfpwNv70ACnzADbKh6Es4jRUJ2eRElcXB0KO1wOvb6PCp940DUBfTUt0HbS3cQaJmRruoC0vk9BtV23jeM2auvDPLd0ZiKrihRF-j2jsgnRokOwWm0btsjM0mDkExQtVSotORUpCQK-plcyvxr2JPF-osgcOIauI1pamSQCpogsjhR4AU6jBC3hPKKehzblJQn0-xH-2qDCkO1jygllGogMb0M6zuQKH5rgqSMwsU9SWj4MtlV-qCr_Dwjbgoyb2ePjcgtznEEtYOq5u6g-1a-CMuP6kaD1hWAs6VjH0QfgLGmhtdAmeaeYJ3nzLPsXXMKizCAYOpAeAlr44qOmuIOfShb9fgg6xkOJaQAmDZ0VPaH-YkxWKQL-KEBXwGOYl9Z1lq0AY4KTH0kijq8WtRGLQGQwCtE_uZB0wWstq3taY-pu28Vn-h3t0uXPwBtwSimzXIi3PQQNRHyG6WZlOF2IjMb0Hf_T6zh_JUxWPn_hxs5NGMk59BfaaZN7cwScLSNTU1-ych6ZybEMP9N8YEA
	const contentHeight = Math.min(1000, this.editor.getContentHeight());

  //@ts-ignore
	this.container.style.height = `${contentHeight}px`;
  let editorWidth = this.editor.getLayoutInfo().width;
	// try {
    // ignoreEvent = true;
		this.editor.layout({ width: editorWidth, height: contentHeight });
    this.editor.layout();
    

    /* 
	} finally {
		ignoreEvent = false;
	} */
};

initializeEditorObject = (theEditor: monaco.editor.IStandaloneCodeEditor) => {
  this.editor = theEditor;
  this.updateHeight();
} 

  ngOnInit(): void {
    this.userCommand = this.examples[this.exampleID]?.tryItYourselfCode?.[0].predefCall;
    this.mainContract = this.examples[this.exampleID]?.tryItYourselfCode?.[0].mainContract;
  }

  resetAll() {
    this.resetButtonClicked.emit();
  }

  test() {
    console.log('test')
    debugger
  }

  async deployAndRun() {

    this.replInstance
        if (this.replInstance === null) {
          this.replInstance = this.injector.get(ReplServiceService)
        }


        try{
          let output : string = await this.replInstance.connectDeployAndCall(this.tryItYourselfCode, this.userCommand, this.mainContract);
          console.log('output:', output )
          this.addToResults(output)
        } catch (error) {
          this.addToResults("There was an error calculating the output, please click the refresh button and try again.")
        }

  }

  addToResults(oneResult: string) {
    this.replOutputs.push(oneResult)
  }

}