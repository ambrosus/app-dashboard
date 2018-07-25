import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';

import { AdministrationRoutingModule } from './administration-routing.module';
import { CompanyComponent } from './components/company/company/company.component';
import { SettingsComponent } from './components/company/settings/settings.component';
import { UserManagementComponent } from './components/user-management/user-management/user-management.component';
import { AdministrationComponent } from './components/administration/administration.component';

@NgModule({
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule
  ],
  declarations: [CompanyComponent, SettingsComponent, UserManagementComponent, AdministrationComponent]
})
export class AdministrationModule { }
