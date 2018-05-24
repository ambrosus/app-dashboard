import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule
  ],
  declarations: [
    // For directives, components and pipes
    // that are to be used in any module/globally.
    // All of them need to be declared here + exported above
  ]
})
export class SharedModule { }
