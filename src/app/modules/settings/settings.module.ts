import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './components/settings/settings.component';
import { GeneralSettingsComponent } from './components/pages/general-settings/general-settings.component';
import { SecuritySettingsComponent } from './components/pages/security-settings/security-settings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    ImageCropperModule,
  ],
  declarations: [SettingsComponent, GeneralSettingsComponent, SecuritySettingsComponent]
})
export class SettingsModule { }
