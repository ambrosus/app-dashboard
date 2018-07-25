import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyComponent } from './components/company/company/company.component';
import { SettingsComponent } from './components/company/settings/settings.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { UsersComponent } from './components/users/users/users.component';
import { AllComponent } from './components/users/all/all.component';
import { InviteComponent } from './components/users/invite/invite.component';

const routes: Routes = [
  {
    path: '',
    component: AdministrationComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/404'
      },
      {
        path: 'company',
        component: CompanyComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'settings'
          },
          {
            path: 'settings',
            component: SettingsComponent
          }
        ]
      },
      {
        path: 'users',
        component: UsersComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'all'
          },
          {
            path: 'all',
            component: AllComponent
          },
          {
            path: 'invite',
            component: InviteComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
