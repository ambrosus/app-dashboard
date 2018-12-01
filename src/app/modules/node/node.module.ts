import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NodeRoutingModule } from './node-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { NodeOutletComponent } from './node-outlet/node-outlet.component';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NodeService } from 'app/services/node.service';
import { OrganizationComponent } from './organization/organization.component';

@NgModule({
  imports: [
    CommonModule,
    NodeRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [NodeService],
  declarations: [
    DashboardComponent,
    OrganizationsComponent,
    NodeOutletComponent,
    OrganizationComponent,
  ],
})
export class NodeModule { }
