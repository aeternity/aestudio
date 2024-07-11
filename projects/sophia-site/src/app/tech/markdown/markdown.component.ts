
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ContentChildren, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../code-block/code-block.component';
import { marked } from 'marked';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicHostDirective } from 'src/app/helpers/utils';
import { SuiModule } from 'ngx-ng2-semantic-ui';
import lodash from 'lodash-es';
import deepdash from 'deepdash-es';
import { examples } from '../examples';
import { CodeBlockWrapperComponent } from '../code-block-wrapper/code-block-wrapper.component';
const _ = deepdash(lodash);

@Component({
  selector: 'app-markdown',
  standalone: true,
  imports: [CommonModule, DynamicHostDirective, SuiModule],
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})

export class MarkdownComponent implements OnInit, AfterViewInit {
  /* @Input()  */content: string;
  compiledMarkdown: string;
  @ViewChild('main', { read: ViewContainerRef }) main: ViewContainerRef;
  dynComponents: Element[]

/*   // Override function
 walkTokens = (token) => {

  if (token.type === 'code') {
    // token.depth += 1;
    token.exampleID = '123';
    console.log('token', token)
  }
}; */

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private sanitizer: DomSanitizer,  private cdr: ChangeDetectorRef) {

      }

  ngOnInit(): void {
 
    (async() => {
      let response = await fetch("assets/markdown/sophia_features.md")
      let markdown = await response.text()
      this.content = markdown
      await this.compileMarkdown();
      setTimeout(() => {

        // let so : HTMLCollectionOf<Element> = document.getElementsByTagName("code-placeholder")
        this.dynComponents = Array.from(document.getElementsByTagName("code-placeholder"));

        this.dynComponents.forEach((element: Element) => {
          const code = element.getAttribute('data-code');
          const exampleID = element.getAttribute('data-exampleID');
          this.loadCodeBlockComponent(element, code, exampleID);
        });
        
      }, 1)

    })();
  }

  ngAfterViewInit(): void {

}

  compileMarkdown(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const renderer = new marked.Renderer();
      // Custom renderer for code blocks
      renderer.code = (code: string, infostring) => {
        let exampleID = '';
        try {
          exampleID =  infostring.match(/exampleID:(\d+)/)[1];
          console.log('exampleID:', exampleID)
        } catch(e){

        }
        const id = `code-block-${Math.random().toString(36).substring(2, 15)}`;
        const placeholder = `<code-placeholder data-code="${encodeURIComponent(code)}" id="${id}" data-exampleID="${exampleID}"></code-placeholder>`;

        return placeholder;
      };

      const rawHtml = await (marked(this.content, { renderer, /* walkTokens: this.walkTokens  */}) as string);
      resolve(this.compiledMarkdown = (this.sanitizer.bypassSecurityTrustHtml(rawHtml) as string));
    });
  }

  loadCodeBlockComponent( nodeElement: Element, code: string, exampleID): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(CodeBlockWrapperComponent);
    // viewContainerRef.clear();

    // const componentRef = viewContainerRef.createComponent(componentFactory);
    const componentRef = this.main.createComponent(componentFactory);

    componentRef.setInput('exampleCode', decodeURIComponent(code))
    if (examples[exampleID]?.tryItYourselfCode?.[0]) {
      componentRef.setInput('tryItYourselfCode', examples[exampleID].tryItYourselfCode[0] )
    }
    nodeElement.parentNode.replaceChild(componentRef.location.nativeElement, nodeElement);


    // will I have to use the old way to lazy-display components ? deferrable views don't seem to be a thing for dynamic components. https://www.youtube.com/watch?v=FCcD8CEGty0
    this.cdr.detectChanges();
  }

}