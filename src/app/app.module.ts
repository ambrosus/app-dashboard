import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

import { AmChartsModule } from '@amcharts/amcharts3-angular';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, CoreModule, DashboardModule, AmChartsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
