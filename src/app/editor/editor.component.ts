import { Component, OnInit, Compiler, HostBinding } from '@angular/core';
import { CompilerService, EncodedACI } from '../compiler.service'
import { Contract } from '../contracts/hamster';
import { ContractControlService } from '../contract-control.service';
import { ContractBase } from '../question/contract-base';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  providers: [ CompilerService ]
})
export class EditorComponent implements OnInit {

  // set the editor's style:
  //@HostBinding('attr.class') css = 'ui segment container';

  // import default contract, after that set this with editor's content
  contract: Contract<string> = new Contract();
  constructor(private compiler: CompilerService, private controlService: ContractControlService) { }

  editorOptions = {theme: 'vs-dark', language: 'sophia'};

  ngOnInit() {
  }

  compile() {
    // replace " => \"
    this.contract.code = this.contract.code.replace(new RegExp('"', 'g'), '\"');

    // remove comments
    this.contract.code = this.contract.code.replace(new RegExp('\\/\\/.*', 'g'), '');
    this.contract.code = this.contract.code.replace(new RegExp('\\/\\*.*[\s\S]*\\*\\/', 'g'), '');

    // code to aci
    console.log("Hier kommt der code: ", this.contract.code);
    this.compiler.fromCodeToACI(this.contract.code)
    .subscribe(
      (data: EncodedACI) => {
      // pass the ACI to the contract-control service to generate a contract instance for the editor
      this.controlService.takeACI(data.encoded_aci);
    },
    error => console.log(error.error));
  }
}
