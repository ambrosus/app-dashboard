import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { TermsComponent } from './components/terms/terms.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';
import { NgSelectModule } from '@ng-select/ng-select';
import { SignupComponent } from './components/signup/signup.component';
import { OrganizationsService } from '../services/organizations.service';

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule,
    NgSelectModule,
    ReactiveFormsModule,
    Angular2PromiseButtonModule.forRoot(),
  ],
  exports: [AppRoutingModule],
  declarations: [
    TermsComponent,
    LoginComponent,
    SignupComponent,
  ],
  providers: [OrganizationsService],
})
export class CoreModule { }
