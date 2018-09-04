import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './components/settings/settings.component';
import { GeneralSettingsComponent } from './components/pages/general-settings/general-settings.component';
import { SecuritySettingsComponent } from './components/pages/security-settings/security-settings.component';
import { NotificationSettingsComponent } from './components/pages/notification-settings/notification-settings.component';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    RouterModule
  ],
  declarations: [SettingsComponent, GeneralSettingsComponent, SecuritySettingsComponent, NotificationSettingsComponent]
})
export class SettingsModule { }
