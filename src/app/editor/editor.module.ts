import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodeFactoryService } from '../code-factory.service';

//import { EditorComponent } from './editor.component';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: []
  //if something is not working, try uncommenting this: bootstrap: [EditorComponent]
})
export class EditorModule { }
 