import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  {path: '', redirectTo: 'chart', pathMatch: 'full'},
  { path: 'chart', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
   { path: '**', redirectTo: '' } 
];
