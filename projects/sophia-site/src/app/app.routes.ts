import { Routes } from '@angular/router';
import { WelcomeComponent } from './ui/welcome/welcome.component';

export const routes: Routes = [
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'welcome', loadComponent: () => import('./ui/welcome/welcome.component').then(m => m.WelcomeComponent) },
    { path: 'docs', loadComponent: () => import('./ui/documentation/documentation.component').then(m => m.DocumentationComponent) },
];
