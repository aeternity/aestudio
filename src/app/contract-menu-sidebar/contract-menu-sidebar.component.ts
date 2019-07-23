import { Component, OnInit } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'contract-menu-sidebar',
  templateUrl: './contract-menu-sidebar.component.html',
  styleUrls: ['./contract-menu-sidebar.component.css']/* ,
  providers: [ CompilerService ] */
})
export class ContractMenuSidebarComponent implements OnInit {

  subscription: Subscription;

  constructor(private compiler: CompilerService) { }
 
  compile() {
    // make compiler emit event

    // @parm: Maybe use param for editor identification later
    this.compiler.makeCompilerAskForCode(1);
  } 

  ngOnInit() {
     this.subscription = this.compiler._fetchActiveCode
       .subscribe(item => console.log("Event in sidebar angekommen")); 
  }
}
