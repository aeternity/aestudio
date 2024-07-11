import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

export const appConfig: ApplicationConfig = {
  // TODO: use router state to bind input toa component: https://angular.dev/guide/routing/common-router-tasks#add-an-input-to-the-component
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules),
    withComponentInputBinding()),
    importProvidersFrom(MonacoEditorModule.forRoot())
  ]
};
