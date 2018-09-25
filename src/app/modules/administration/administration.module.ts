import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { RoleDialogComponent } from './components/users/roles/role-dialog/role-dialog.component';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons/dist';
import { UsersService } from '../../services/users.service';


@NgModule({
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    Angular2PromiseButtonModule.forRoot({
      spinnerTpl: '<span class="btn-spinner"></span>',
      disableBtn: true,
      btnLoadingClass: 'is-loading',
      handleCurrentBtnOnly: false,
    }),
    FormsModule
  ],
  providers: [UsersService],
  declarations: [CompanyComponent, SettingsComponent, UsersComponent, AdministrationComponent, AllComponent, InviteComponent, InvitesComponent, RolesComponent, RoleDialogComponent],
  entryComponents: [RoleDialogComponent]
})
export class AdministrationModule { }
