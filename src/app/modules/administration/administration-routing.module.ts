import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyComponent } from './components/company/company/company.component';
import { SettingsComponent } from './components/company/settings/settings.component';
import { UserManagementComponent } from './components/user-management/user-management/user-management.component';
import { AdministrationComponent } from './components/administration/administration.component';

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
        path: 'user-management',
        component: UserManagementComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
