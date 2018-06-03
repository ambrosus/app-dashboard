import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from "app/shared/components/header/header.component";
import {FooterComponent} from "app/shared/components/footer/footer.component";
import {InputDirective} from "app/shared/directives/input.directive";
import {OncheckedDirective} from "./directives/onchecked.directive";
import {ClickThisActiveDirective} from "./directives/click-this-active.directive";
import {RouterModule} from "@angular/router";
import { SpinnerComponent } from 'app/shared/components/spinner/spinner.component';
import { AssetsLoaderIndicatorComponent } from 'app/shared/components/assets-loader-indicator/assets-loader-indicator.component';
import {AutocompleteinputDirective} from './directives/autocompleteinput.directive';

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
    SpinnerComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    ClickThisActiveDirective,
    SpinnerComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective
    // For directives, components and pipes
    // that are to be used in any module/globally.
    // All of them need to be declared here + exported above
  ]
})
export class SharedModule { }
