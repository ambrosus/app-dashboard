import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from "app/shared/header/header.component";
import {FooterComponent} from "app/shared/footer/footer.component";
import {InputDirective} from "app/shared/directives/input.directive";
import {OncheckedDirective} from "./directives/onchecked.directive";
import {ClickThisActiveDirective} from "./directives/click-this-active.directive";
import {RouterModule} from "@angular/router";
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    ClickThisActiveDirective,
    SpinnerComponent
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    ClickThisActiveDirective,
    SpinnerComponent
    // For directives, components and pipes
    // that are to be used in any module/globally.
    // All of them need to be declared here + exported above
  ]
})
export class SharedModule { }
