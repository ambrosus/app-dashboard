import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { AdministrationRoutingModule } from './administration-routing.module';
import { CompanyComponent } from './components/company/company/company.component';
import { SettingsComponent } from './components/company/settings/settings.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { UsersComponent } from './components/users/users/users.component';
import { AllComponent } from './components/users/all/all.component';
import { InviteComponent } from './components/users/invite/invite.component';
import { InvitesComponent } from './components/users/invites/invites.component';
import { RolesComponent } from './components/users/roles/roles.component';
import { AddRoleDialogComponent } from './components/users/roles/add-role-dialog/add-role-dialog.component';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';

@NgModule({
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    Angular2PromiseButtonModule.forRoot()
  ],
  declarations: [CompanyComponent, SettingsComponent, UsersComponent, AdministrationComponent, AllComponent, InviteComponent, InvitesComponent, RolesComponent, AddRoleDialogComponent],
  entryComponents: [AddRoleDialogComponent]
})
export class AdministrationModule { }
