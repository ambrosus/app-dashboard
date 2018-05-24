import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from "./header/header.component";
import {FooterComponent} from "./footer/footer.component";
import {InputDirective} from "./directives/input.directive";

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    InputDirective
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    InputDirective
    // For directives, components and pipes
    // that are to be used in any module/globally.
    // All of them need to be declared here + exported above
  ]
})
export class SharedModule { }
