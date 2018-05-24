import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {ReactiveFormsModule} from "@angular/forms";
import {AuthModule} from "./auth/auth.module";
import {CoreModule} from "./core/core.module";
import {DashboardModule} from "./dashboard/dashboard.module";
import {SharedModule} from "./shared/shared.module";
import { InputDirective } from './shared/directives/input.directive';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    // Module per each bigger part of the app
    AuthModule,
    // Core: for global components (header, footer, notfound..)
    CoreModule,
    DashboardModule,
    // Shared: for directives, components and pipes
    // exported to be used globally reusable, in any module
    SharedModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
