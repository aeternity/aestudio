
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import * as SuiModule from "ngx-ng2-semantic-ui";

@NgModule({ 
  declarations: [
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
