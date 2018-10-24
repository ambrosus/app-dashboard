import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationOutletComponent } from './organization-outlet/organization-outlet.component';
import { SettingsComponent } from './settings/settings.component';
import { AllComponent } from './accounts/all/all.component';
import { InviteComponent } from './accounts/invite/invite.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountComponent } from './accounts/account/account.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationOutletComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DashboardComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'accounts',
        data: { permissions: ['manage_accounts'] },
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: AllComponent,
          },
          {
            path: 'invite',
            component: InviteComponent,
          },
          {
            path: ':email',
            component: AccountComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule { }
