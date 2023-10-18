
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CompilerService } from '../compiler.service'
import { Subscription } from 'rxjs';
import { ContractBase } from '../question/contract-base';
import { FormGroup }        from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
/* import { ReplacePipe } from './contract-menu-sidebar.component' */

import * as SuiModule from "ngx-ng2-semantic-ui";


//import { SuiDropdownModule } from 'ng2-semantic-ui-ngx';

@NgModule({ 
  declarations: [/* ReplacePipe */
  ],
  imports: [
    BrowserModule,     SuiModule.SuiAccordionModule,
    SuiModule.SuiSelectModule,
    SuiModule.SuiSidebarModule,
    SuiModule.SuiMessageModule,
    SuiModule.SuiPaginationModule,
    SuiModule.SuiCheckboxModule,
    SuiModule.SuiCollapseModule,
    SuiModule.SuiDatepickerModule,
    SuiModule.SuiDimmerModule,
    SuiModule.SuiDropdownModule,
    SuiModule.SuiModalModule,
    SuiModule.SuiPopupModule,
    SuiModule.SuiProgressModule,
    SuiModule.SuiRatingModule,
    SuiModule.SuiSearchModule,
    SuiModule.SuiAccordionModule,
    SuiModule.SuiTransitionModule,
    SuiModule.SuiTabsModule,
  ],
  providers: [],
  bootstrap: []
  //if something is not working, try uncommenting this: bootstrap: [EditorComponent]
})

export class ContractMenuSidebarModule {}
