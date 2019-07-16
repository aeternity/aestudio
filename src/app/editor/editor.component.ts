import { Component, OnInit, Compiler } from '@angular/core';
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
    console.log(this.contract.code.substring(0, 10))
    this.compiler.fromCodeToACI(this.contract.code)
    .subscribe(
      (data: EncodedACI) => {
      console.log(data)
      this.controlService.takeACI(data.encoded_aci);
      this.controlService.parseACI();
    },
    error => console.log(error));
  }
}
