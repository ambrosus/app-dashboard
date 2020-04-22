import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GettingStartedComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

  getSignUpUrl() {
    return `${window.location.origin}/signup`;
  }

}
