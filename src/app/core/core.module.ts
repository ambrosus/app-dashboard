import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { TermsComponent } from './components/terms/terms.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { OrganizationsService } from '../services/organizations.service';
import { SecureKeysComponent } from './components/signup/secure-keys/secure-keys.component';
import { MatDialogModule } from '@angular/material';
import { OwnKeyComponent } from './components/signup/own-key/own-key.component';
import { GeneratedKeyComponent } from './components/signup/generated-key/generated-key.component';
import { RequestComponent } from './components/signup/request/request.component';
import { InitialComponent } from './components/signup/initial/initial.component';
import { HelpComponent } from './components/help/help.component';
import { AssetsComponent } from './components/help/pages/assets/assets.component';
import { OrganizationDashboardComponent } from './components/help/pages/organization-dashboard/organization-dashboard.component';
import { NodeDashboardComponent } from './components/help/pages/node-dashboard/node-dashboard.component';
import { LoginSignupComponent } from './components/help/pages/login-signup/login-signup.component';
import { IntroductionComponent } from './components/help/pages/introduction/introduction.component';

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  exports: [
    AppRoutingModule,
  ],
  declarations: [
    TermsComponent,
    LoginComponent,
    SignupComponent,
    SecureKeysComponent,
    OwnKeyComponent,
    GeneratedKeyComponent,
    RequestComponent,
    InitialComponent,
    HelpComponent,
    AssetsComponent,
    OrganizationDashboardComponent,
    NodeDashboardComponent,
    LoginSignupComponent,
    IntroductionComponent,
  ],
  providers: [OrganizationsService],
  entryComponents: [
    SecureKeysComponent,
  ],
})
export class CoreModule { }
