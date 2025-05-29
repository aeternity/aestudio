import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContractInLeftMenuComponent } from '../contract-in-left-menu/contract-in-left-menu.component';

//import { EditorComponent } from './editor.component';

@NgModule({
  declarations: [ContractInLeftMenuComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, ContractInLeftMenuComponent],
  providers: [],
  bootstrap: [],
  //if something is not working, try uncommenting this: bootstrap: [EditorComponent]
})
export class EditorModule {}
