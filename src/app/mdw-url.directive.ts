import {
  Directive,
  ElementRef,
  Renderer2,
  HostListener,
  AfterViewInit,
  OnInit,
  AfterContentInit,
  AfterViewChecked,
} from '@angular/core';
import { CompilerService } from './compiler.service';

@Directive({
  selector: '[mdwUrl]',
})
export class MdwUrlDirective {
  @HostListener('mouseenter') onMouseEnter() {
    /*  console.log("directive: in!") */
  }

  @HostListener('mouseleave') onMouseLeave() {
    /*   console.log("directive: out!") */
  }

  constructor(
    private el: ElementRef,
    private compiler: CompilerService,
    private renderer: Renderer2,
  ) {
    this.addUrl();
  }

  ngAfterViewInit() {
    this.addUrl();
  }

  ngOnInit() {
    //this.addUrl()
  }

  ngAfterContentInit() {
    //this.addUrl()
  }

  ngAfterViewChecked() {
    //this.addUrl()
  }

  addUrl() {
    //setTimeout(() => {
    let currentNetwork: string;
    (async () => {
      let { nodeNetworkId } = await this.compiler.Chain.getNodeInfo();
      currentNetwork = nodeNetworkId;
    })();
    // generate links only if it's test- or mainnet
    if (currentNetwork != 'ae_uat' && currentNetwork != 'ae_mainnet') {
      return;
    }

    let currentContent: string = this.el.nativeElement.innerText;

    /* console.log("directive network id:", currentNetwork)
      console.log("directive network id direct:", this.compiler.Chain?.selectedNode.networkId)
      console.log("current content:", currentContent)
      console.log("nur el:", this.el.nativeElement) */

    var baseUrl: string;
    if (currentNetwork == 'ae_uat') {
      baseUrl = 'https://explorer.testnet.aeternity.io';
    } else {
      baseUrl = 'https://explorer.aeternity.io';
    }

    var middlewareLink: string;
    var generationsRegex = new RegExp(`^\d+$`, 'gm');
    var transactionHashRegex = new RegExp(`^th_[1-9A-HJ-NP-Za-km-z]{48,50}$`, 'gm');
    var oracleQueryRegex = new RegExp(`^ok_[1-9A-HJ-NP-Za-km-z]{48,50}$`, 'gm');
    var contractTransactionRegex = new RegExp(`^ct_[1-9A-HJ-NP-Za-km-z]{48,50}$`, 'gm');
    var accountTransactionRegex = new RegExp(`^ak_[1-9A-HJ-NP-Za-km-z]{48,50}$`, 'gm');

    if (!currentContent || typeof currentContent != 'string') {
      return;
    }

    if (currentContent.match(/^\d+$/)) {
      //middlewareLink = `${baseUrl}/generations/${currentContent}`
      return;
    } else if (currentContent.match(transactionHashRegex)) {
      middlewareLink = `${baseUrl}/transactions/${currentContent}`;
      //console.log("Found th !")
    } else if (currentContent.match(oracleQueryRegex)) {
      middlewareLink = `${baseUrl}/oracles/queries/${currentContent}`;
      //console.log("Found ok")
    } else if (currentContent.match(contractTransactionRegex)) {
      middlewareLink = `${baseUrl}/contracts/transactions/${currentContent}`;
      //console.log("Found ct")
    } else if (currentContent.match(accountTransactionRegex)) {
      middlewareLink = `${baseUrl}/account/transactions/${currentContent}`;
      //console.log("Found ak")
    } else {
      return;
    }

    // create new link
    const newLink = this.renderer.createElement('a');
    this.renderer.setAttribute(newLink, 'href', middlewareLink);
    this.renderer.setAttribute(newLink, 'target', '_blank');
    this.renderer.addClass(newLink, 'middlewareLink');
    const text = this.renderer.createText(currentContent);

    // put the link into the element
    this.renderer.appendChild(newLink, text);

    //this.renderer.setAttribute(newLink, "innerText", "TEST TEST TEST")

    // delete the old content
    this.renderer.setProperty(this.el.nativeElement, 'textContent', '');

    // append it to the element
    this.renderer.appendChild(this.el.nativeElement, newLink);

    //}, 200)
  }
}
