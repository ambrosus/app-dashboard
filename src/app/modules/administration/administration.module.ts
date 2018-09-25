import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';

import { SharedModule } from 'app/shared/shared.module';
import { UsersService } from 'app/services/users.service';

import { AdministrationRoutingModule } from './administration-routing.module';
import { CompanyComponent } from './components/company/company/company.component';
import { SettingsComponent } from './components/company/settings/settings.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { UsersComponent } from './components/users/users/users.component';
import { AllComponent } from './components/users/all/all.component';
import { InviteComponent } from './components/users/invite/invite.component';
import { InvitesComponent } from './components/users/invites/invites.component';
import { RolesComponent } from './components/users/roles/roles.component';
import { RoleDialogComponent } from './components/users/roles/role-dialog/role-dialog.component';



@NgModule({
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    Angular2PromiseButtonModule.forRoot(),
    FormsModule
  ],
  providers: [UsersService],
  declarations: [CompanyComponent, SettingsComponent, UsersComponent, AdministrationComponent, AllComponent, InviteComponent, InvitesComponent, RolesComponent, RoleDialogComponent],
  entryComponents: [RoleDialogComponent]
})
export class AdministrationModule { }
