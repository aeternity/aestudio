import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { FireEditorComponent } from './fire-editor/fire-editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { EditorComponent } from './editor/editor.component';
import { ContractMenuSidebarComponent } from './contract-menu-sidebar/contract-menu-sidebar.component';
import * as SuiModule from 'ngx-ng2-semantic-ui';

import { ReplacePipe, ReturndataPipe } from './helpers/replace-pipe';
import { LoaderComponent } from './loader/loader.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ClipboardModule } from 'ngx-clipboard';
import { DeployedContractComponent } from './deployed-contract/deployed-contract.component';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { LocalStorageService } from './local-storage.service';
import { ContractInLeftMenuComponent } from './contract-in-left-menu/contract-in-left-menu.component';
import { OneEditorTabComponent } from './one-editor-tab/one-editor-tab.component';
import { LogConsoleComponent } from './log-console/log-console.component';
import { OneLogComponent } from './one-log/one-log.component';
import { TxValuesComponent } from './tx-values/tx-values.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { TerminalModule } from './repl-terminal/terminal.module';
import { NgClickOutsideDirective } from 'ng-click-outside2';

// firebase start

//contract sharing and user login disabled for now

/* import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { UserProfileComponent } from './user-profile/user-profile.component';
 */
// firebase end
import { MainloaderComponent } from './mainloader/mainloader.component';
import { WalletSwitchComponent } from './wallet-switch/wallet-switch.component';
import { OneLogChildComponent } from './one-log-child/one-log-child.component';
import { GlobalOptionsComponent } from './global-options/global-options.component';
import { PreventClickPropagationDirective } from './prevent-click-propagation.directive';
import { MdwUrlDirective } from './mdw-url.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditorAutoResizerDirective } from './directives/editor-auto-resizer.directive';
import { ConsoleOpenerDirective } from './directives/console-opener.directive';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    ContractMenuSidebarComponent,
    ReplacePipe,
    ReturndataPipe,
    LoaderComponent,
    DeployedContractComponent,
    ContractInLeftMenuComponent,
    OneEditorTabComponent,
    LogConsoleComponent,
    OneLogComponent,
    TxValuesComponent,
    MainloaderComponent,
    WalletSwitchComponent,
    OneLogChildComponent,
    GlobalOptionsComponent,
    PreventClickPropagationDirective,
    MdwUrlDirective,
    EditorAutoResizerDirective,
    ConsoleOpenerDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(),
    SuiModule.SuiAccordionModule,
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
    NgClickOutsideDirective,
    InlineSVGModule.forRoot(),
    ClipboardModule,
    StorageServiceModule,
    /*   AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule, */
    DigitOnlyModule,
    // Specify ng-circle-progress as an import
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 500,
    }),
    FontAwesomeModule,
    TerminalModule,
  ],
  providers: [LocalStorageService],
  bootstrap: [MainloaderComponent],
})
export class AppModule {}
