import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'app/shared/components/header/header.component';
import { FooterComponent } from 'app/shared/components/footer/footer.component';
import { InputDirective } from 'app/shared/directives/input.directive';
import { OncheckedDirective } from './directives/onchecked.directive';
import { ClickThisActiveDirective } from './directives/click-this-active.directive';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from 'app/shared/components/spinner/spinner.component';
import { AssetsLoaderIndicatorComponent } from 'app/shared/components/assets-loader-indicator/assets-loader-indicator.component';
import { AutocompleteinputDirective } from './directives/autocompleteinput.directive';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { AccordionDirective } from './directives/accordion.directive';

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    ClickThisActiveDirective,
    SpinnerComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective,
    BreadcrumbsComponent,
    AccordionDirective
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    ClickThisActiveDirective,
    SpinnerComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective,
    BreadcrumbsComponent,
    AccordionDirective
  ]
})
export class SharedModule {}
