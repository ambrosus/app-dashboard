import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from "app/shared/header/header.component";
import {FooterComponent} from "app/shared/footer/footer.component";
import {InputDirective} from "app/shared/directives/input.directive";
import {OncheckedDirective} from "./directives/onchecked.directive";
import {ClickThisActiveDirective} from "./directives/click-this-active.directive";
import {RouterModule} from "@angular/router";

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
    ClickThisActiveDirective
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    ClickThisActiveDirective
    // For directives, components and pipes
    // that are to be used in any module/globally.
    // All of them need to be declared here + exported above
  ]
})
export class SharedModule { }
