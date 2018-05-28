import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from 'app/modules/auth/auth-routing.module';
import { LoginComponent } from 'app/modules/auth/login/login.component';
import {SharedModule} from "app/shared/shared.module";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent
  ]
})
export class AuthModule { }
