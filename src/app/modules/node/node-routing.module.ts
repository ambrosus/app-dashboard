import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NodeOutletComponent } from './node-outlet/node-outlet.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountsComponent } from './accounts/accounts.component';
import { OrganizationsComponent } from './organizations/organizations.component';

const routes: Routes = [
  {
    path: '',
    component: NodeOutletComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DashboardComponent,
      },
      {
        path: 'organizations',
        component: OrganizationsComponent,
      },
      {
        path: 'accounts',
        data: { permissions: ['manage_accounts'] },
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: AccountsComponent,
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
export class NodeRoutingModule { }
