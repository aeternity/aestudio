import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { FireEditorComponent } from './fire-editor/fire-editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { DynamicFormComponent }         from './dynamic-form/dynamic-form.component';
import { DynamicFormQuestionComponent } from './dynamic-form-question/dynamic-form-question.component';
import { EditorComponent } from './editor/editor.component';
import { ContractMenuSidebarComponent } from './contract-menu-sidebar/contract-menu-sidebar.component';
import {SuiModule} from 'ng2-semantic-ui';
import {LogMonitorModule} from 'ngx-log-monitor';
//import { SuiSelectModule } from 'ng2-semantic-ui';
import { ReplacePipe } from './helpers/replace-pipe';
import { LoaderComponent } from './loader/loader.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { SuiSelectModule } from 'ng2-semantic-ui';
import { ClipboardModule } from 'ngx-clipboard';
import { DeployedContractComponent } from './deployed-contract/deployed-contract.component';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { LocalStorageService } from './local-storage.service';



@NgModule({
  declarations: [
    AppComponent, 
    DynamicFormComponent, 
    DynamicFormQuestionComponent, EditorComponent, ContractMenuSidebarComponent, ReplacePipe, LoaderComponent, DeployedContractComponent
  ],
  imports: [
    BrowserModule,
    LogMonitorModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(),
    SuiModule,
    InlineSVGModule.forRoot(),
    ClipboardModule,
    StorageServiceModule    
  ],
  providers: [LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
