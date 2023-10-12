
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { FormGroup }        from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { ReplacePipe } from './contract-menu-sidebar.component'
import { SuiModule } from 'ng2-semantic-ui-ngx';
import { SuiSelectModule } from 'ng2-semantic-ui-ngx';



//import { SuiDropdownModule } from 'ng2-semantic-ui-ngx';

@NgModule({ 
  declarations: [ReplacePipe
  ],
  imports: [
    BrowserModule, SuiModule, SuiSelectModule,
  ],
  providers: [],
  bootstrap: []
  //if something is not working, try uncommenting this: bootstrap: [EditorComponent]
})

export class ContractMenuSidebarModule {}
