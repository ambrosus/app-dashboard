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
import { IntroductionComponent } from './components/help/pages/introduction/introduction.component';
import { LoggingIntoTheAccountComponent } from './components/help/pages/logging-into-the-account/logging-into-the-account.component';
import { InvitingUsersAndManagingAccountsComponent } from './components/help/pages/inviting-users-and-managing-accounts/inviting-users-and-managing-accounts.component';
import { ViewingAndCreatingAssetsComponent } from './components/help/pages/viewing-and-creating-assets/viewing-and-creating-assets.component';
import { ViewingAndCreatingEventsComponent } from './components/help/pages/viewing-and-creating-events/viewing-and-creating-events.component';
import { SearchingForAssetsComponent } from './components/help/pages/searching-for-assets/searching-for-assets.component';
import { ViewingOrganizationStatisticsComponent } from './components/help/pages/viewing-organization-statistics/viewing-organization-statistics.component';
import { GettingStartedComponent } from './components/help/pages/getting-started/getting-started.component';
import { EditingPersonalAccountSettingsComponent } from './components/help/pages/editing-personal-account-settings/editing-personal-account-settings.component';
import { EditingOrganizationDetailsComponent } from './components/help/pages/editing-organization-details/editing-organization-details.component';

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
    IntroductionComponent,
    LoggingIntoTheAccountComponent,
    InvitingUsersAndManagingAccountsComponent,
    ViewingAndCreatingAssetsComponent,
    ViewingAndCreatingEventsComponent,
    SearchingForAssetsComponent,
    ViewingOrganizationStatisticsComponent,
    GettingStartedComponent,
    EditingPersonalAccountSettingsComponent,
    EditingOrganizationDetailsComponent,
  ],
  providers: [OrganizationsService],
  entryComponents: [
    SecureKeysComponent,
  ],
})
export class CoreModule { }
