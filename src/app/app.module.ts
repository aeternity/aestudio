import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoFormSkuComponent } from './demo-form-sku/demo-form-sku.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { DynamicFormComponent }         from './dynamic-form/dynamic-form.component';
import { DynamicFormQuestionComponent } from './dynamic-form-question/dynamic-form-question.component';
import { EditorComponent } from './editor/editor.component';
import { ContractMenuSidebarComponent } from './contract-menu-sidebar/contract-menu-sidebar.component';
import {SuiModule} from 'ng2-semantic-ui';

@NgModule({
  declarations: [
    AppComponent,
    DemoFormSkuComponent, 
    DynamicFormComponent, 
    DynamicFormQuestionComponent, EditorComponent, ContractMenuSidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(),
    SuiModule    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
