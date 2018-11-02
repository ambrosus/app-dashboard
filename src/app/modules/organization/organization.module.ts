import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';

import { SharedModule } from 'app/shared/shared.module';

import { OrganizationRoutingModule } from './organization-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { AllComponent } from './accounts/all/all.component';
import { InviteComponent } from './accounts/invite/invite.component';
import { AccountComponent } from './accounts/account/account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrganizationOutletComponent } from './organization-outlet/organization-outlet.component';

@NgModule({
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    Angular2PromiseButtonModule.forRoot(),
    FormsModule,
  ],
  declarations: [
    AllComponent,
    InviteComponent,
    SettingsComponent,
    AccountComponent,
    DashboardComponent,
    OrganizationOutletComponent,
  ],
  entryComponents: [],
})
export class OrganizationModule { }
