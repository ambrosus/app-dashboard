import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NodeRoutingModule } from './node-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { AccountsComponent } from './accounts/accounts.component';
import { NodeOutletComponent } from './node-outlet/node-outlet.component';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';
import { NodeService } from 'app/services/node.service';
import { OrganizationComponent } from './organization/organization.component';

@NgModule({
  imports: [
    CommonModule,
    NodeRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    Angular2PromiseButtonModule.forRoot(),
    FormsModule,
  ],
  providers: [NodeService],
  declarations: [
    DashboardComponent,
    OrganizationsComponent,
    AccountsComponent,
    NodeOutletComponent,
    OrganizationComponent,
  ],
})
export class NodeModule {}
