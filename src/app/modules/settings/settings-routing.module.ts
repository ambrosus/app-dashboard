import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './components/settings/settings.component';
import { GeneralSettingsComponent } from './components/pages/general-settings/general-settings.component';
import { SecuritySettingsComponent } from './components/pages/security-settings/security-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/settings/general',
      },
      {
        path: 'general',
        component: GeneralSettingsComponent,
      },
      {
        path: 'security',
        component: SecuritySettingsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule { }
