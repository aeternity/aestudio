
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ContentChildren, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../rich-code-block/code-block.component';
import { marked } from 'marked';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicHostDirective } from 'src/app/helpers/utils';

@Component({
  selector: 'app-markdown',
  standalone: true,
  imports: [CommonModule, DynamicHostDirective],
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})

export class MarkdownComponent implements OnInit, AfterViewInit {
  /* @Input()  */content: string;
  compiledMarkdown: string;
  that = this;
  @ViewChild('main', { read: ViewContainerRef }) main: ViewContainerRef;
  dynComponents: Element[]

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private sanitizer: DomSanitizer,  private cdr: ChangeDetectorRef) {
 

  }

  ngOnInit(): void {
 
    (async() => {
      let response = await fetch("assets/markdown/sophia_features.md")
      let markdown = await response.text()
      this.content = markdown
      await this.compileMarkdown();
      setTimeout(() => {

        let so = document.getElementsByTagName("code-placeholder")
        this.dynComponents = Array.from(document.getElementsByTagName("code-placeholder"));

        this.dynComponents.forEach((element: Element) => {
          const code = element.getAttribute('data-code');
          this.loadCodeBlockComponent(this.main, code, element);
        });
        
      }, 1)

    })();
/* 
    fetch("assets/markdown/sophia_features.md")
    .then(response => {
      //console.log(response.text())
      return response.text()
    }) .then(async text => {
      that.content = text
      await this.compileMarkdown();

      this.dynComponents = Array.from(document.getElementsByTagName("code-placeholder"));
      debugger
      this.dynComponents.forEach((element: Element) => {
        const code = element.getAttribute('data-code');
        this.loadCodeBlockComponent(this.main, code, element);
      });

    }) */
  }

  ngAfterViewInit(): void {

  /*   this.dynComponents = Array.from(document.getElementsByTagName("code-placeholder"));
   debugger
   this.dynComponents.forEach((element: Element) => {
     const code = element.getAttribute('data-code');
     this.loadCodeBlockComponent(this.main, code, element);
   }); */


 /*    this.dynComponents.forEach((host, index) => {
      console.log(`Element ${index + 1}:`, host);
    }); */




}

  compileMarkdown(): Promise<string> {
    return new Promise(async (resolve, reject) => {

      const renderer = new marked.Renderer();
      
      // Custom renderer for code blocks
      renderer.code = (code: string, language: string) => {
        const id = `code-block-${Math.random().toString(36).substring(2, 15)}`;
        const placeholder = `<code-placeholder data-code="${encodeURIComponent(code)}" id="${id}"></code-placeholder>`;
        return placeholder;
      };
      
      const rawHtml = await (marked(this.content, { renderer }) as string);
      resolve(this.compiledMarkdown = (this.sanitizer.bypassSecurityTrustHtml(rawHtml) as string));
    });
  }

  loadCodeBlockComponent(viewContainerRef: ViewContainerRef, code: string, nodeElement: Element): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(CodeBlockComponent);
    // viewContainerRef.clear();

    // const componentRef = viewContainerRef.createComponent(componentFactory);
    const componentRef = this.main.createComponent(componentFactory);
    
    componentRef.instance.code = decodeURIComponent(code);

    nodeElement.parentNode.replaceChild(componentRef.location.nativeElement, nodeElement);

    this.cdr.detectChanges();
  }


}