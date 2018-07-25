import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'app/shared/components/header/header.component';
import { FooterComponent } from 'app/shared/components/footer/footer.component';
import { InputDirective } from 'app/shared/directives/input.directive';
import { OncheckedDirective } from './directives/onchecked.directive';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from 'app/shared/components/spinner/spinner.component';
import { AssetsLoaderIndicatorComponent } from 'app/shared/components/assets-loader-indicator/assets-loader-indicator.component';
import { AutocompleteinputDirective } from './directives/autocompleteinput.directive';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { AccordionDirective } from './directives/accordion.directive';
import { StickyDirective } from './directives/sticky.directive';
import { LoopIncludePipe } from './pipes/loop-include.pipe';
import { LoopExcludePipe } from './pipes/loop-exclude.pipe';
import { TimelineComponent } from 'app/shared/components/timeline/timeline.component';
import { JsonPreviewComponent } from 'app/shared/components/json-preview/json-preview.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    SpinnerComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective,
    BreadcrumbsComponent,
    AccordionDirective,
    StickyDirective,
    LoopIncludePipe,
    LoopExcludePipe,
    TimelineComponent,
    JsonPreviewComponent
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    InputDirective,
    OncheckedDirective,
    SpinnerComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective,
    BreadcrumbsComponent,
    AccordionDirective,
    StickyDirective,
    LoopIncludePipe,
    LoopExcludePipe,
    TimelineComponent,
    JsonPreviewComponent
  ]
})
export class SharedModule {}
