import { Component, OnInit, Input, Compiler, HostBinding, OnChanges, SimpleChanges  } from '@angular/core';
import { CompilerService, EncodedACI } from '../compiler.service'
import { Contract } from '../contracts/hamster';
import { ContractControlService } from '../contract-control.service';
import { ContractBase } from '../question/contract-base';
import { Subscription } from 'rxjs';
import { getNumberOfCurrencyDigits } from '@angular/common';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']/* ,
  providers: [ CompilerService ] */
})
export class EditorComponent implements OnInit {

  // set the editor's style:
  //@HostBinding('attr.class') css = 'ui segment container';

  @HostBinding('style.border') value = 'red';

  // listen to compiler events asking to send code
  subscription: Subscription;

  // note if this editor is currently in active tab
  isActiveTab : boolean = true;

  // import default contract, after that set this with editor's content
  contract: Contract<string> = new Contract();
  constructor(private compiler: CompilerService, private controlService: ContractControlService) { }

  editorOptions = {theme: 'vs-dark', language: 'aes'};

  ngOnInit() {
    // If the compiler asks for code, give it to him and deploy the contract
    this.subscription = this.compiler._fetchActiveCode
      .subscribe(item => {console.log("Im editor angekommen !"); 
      this.compiler.generateACIonly(this.contract.code);
    // Beim start schon copilen oder nicht ?
    //  return this.compile();
  
  }); 
  }

  change(){
    //console.log("Shit done changed!");
    // put the active code into compiler
    this.compiler.makeCompilerAskForCode(0);
console.log("code ist gerade: ",this.contract.code);
    // generate some ACI just to display init() function for deployment
    this.compiler.generateACIonly(this.contract.code);
  }

  /* // for now, just set the ACI
  compile() : Promise<any> {
    //console.log("compile gerunnt");
    return this.compiler.compileAndDeploy(this.contract.code);
  } */

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.subscription.unsubscribe();
  }
}
