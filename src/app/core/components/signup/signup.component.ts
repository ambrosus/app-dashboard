import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignupComponent {

  constructor() { }
}
