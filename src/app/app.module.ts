import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { FireEditorComponent } from './fire-editor/fire-editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { EditorComponent } from './editor/editor.component';
import { ContractMenuSidebarComponent } from './contract-menu-sidebar/contract-menu-sidebar.component';
import {SuiModule} from 'ng2-semantic-ui';

//import { SuiSelectModule } from 'ng2-semantic-ui';
import { ReplacePipe } from './helpers/replace-pipe';
import { LoaderComponent } from './loader/loader.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { ClipboardModule } from 'ngx-clipboard';
import { DeployedContractComponent } from './deployed-contract/deployed-contract.component';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { LocalStorageService } from './local-storage.service';
import { ContractInLeftMenuComponent } from './contract-in-left-menu/contract-in-left-menu.component';
import { OneEditorTabComponent } from './one-editor-tab/one-editor-tab.component';
import { LogConsoleComponent } from './log-console/log-console.component';
import { OneLogComponent } from './one-log/one-log.component'
import { environment } from '../environments/environment';
import { TxValuesComponent } from './tx-values/tx-values.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { DigitOnlyModule } from '@uiowa/digit-only';

// firebase start 
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { MainloaderComponent } from './mainloader/mainloader.component';
// firebase end



@NgModule({
  declarations: [
    AppComponent, 
    EditorComponent,
    ContractMenuSidebarComponent,
    ReplacePipe,
    LoaderComponent,
    DeployedContractComponent, 
    ContractInLeftMenuComponent, 
    OneEditorTabComponent, LogConsoleComponent, OneLogComponent, TxValuesComponent, UserProfileComponent, MainloaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(),
    SuiModule,
    InlineSVGModule.forRoot(),
    ClipboardModule,
    StorageServiceModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    DigitOnlyModule,
    // Specify ng-circle-progress as an import
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 500,
    })
  ],
  providers: [LocalStorageService],
  bootstrap: [MainloaderComponent]
})
export class AppModule { }
