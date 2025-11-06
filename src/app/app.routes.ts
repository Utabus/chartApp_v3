import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  {path: '', redirectTo: 'chart', pathMatch: 'full'},
  { path: 'chart', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
   { path: '**', redirectTo: '' } 
];
