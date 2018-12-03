import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { TermsComponent } from './components/terms/terms.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SignupComponent } from './components/signup/signup.component';
import { OrganizationsService } from '../services/organizations.service';

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule,
    NgSelectModule,
    ReactiveFormsModule,
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
