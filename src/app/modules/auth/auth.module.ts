import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from 'app/modules/auth/auth-routing.module';
import { LoginComponent } from 'app/modules/auth/login/login.component';
import { SharedModule } from 'app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [LoginComponent, SigninComponent, SignupComponent],
  exports: [SigninComponent, SignupComponent]
})
export class AuthModule {}
