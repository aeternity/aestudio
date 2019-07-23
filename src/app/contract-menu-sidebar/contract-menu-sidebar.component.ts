import { Component, OnInit } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { FormGroup }        from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'replace'})
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {

    if(!value || ! strToReplace || ! replacementStr)
    {
      return value;
    }

 return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
}

@Component({
  selector: 'contract-menu-sidebar',
  templateUrl: './contract-menu-sidebar.component.html',
  styleUrls: ['./contract-menu-sidebar.component.css']/* ,
  providers: [ CompilerService ] */
})
export class ContractMenuSidebarComponent implements OnInit {

  subscription: Subscription;
  aci: ContractBase<any>;

  constructor(private compiler: CompilerService) { }
 
  buildAContract() {
    // make compiler emit event

    // @parm: Maybe use param for editor identification later
    this.compiler.makeCompilerAskForCode(1);

    // take the ACI/ContractBase the compiler stores
    this.aci = this.compiler.aci;
    console.log(this.aci);
  } 

  ngOnInit() {
     this.subscription = this.compiler._fetchActiveCode
       .subscribe(item => console.log("Event in sidebar angekommen")); 
  }
}
