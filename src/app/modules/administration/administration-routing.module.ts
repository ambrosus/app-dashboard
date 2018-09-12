import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyComponent } from './components/company/company/company.component';
import { SettingsComponent } from './components/company/settings/settings.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { UsersComponent } from './components/users/users/users.component';
import { AllComponent } from './components/users/all/all.component';
import { InviteComponent } from './components/users/invite/invite.component';
import { InvitesComponent } from './components/users/invites/invites.component';
import { RolesComponent } from './components/users/roles/roles.component';

const routes: Routes = [
  {
    path: '',
    component: AdministrationComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'users'
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
          },
          {
            path: 'invites',
            component: InvitesComponent
          },
          {
            path: 'roles',
            component: RolesComponent
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
