import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HelpComponent {
  sidebar = [
    {
      title: 'Introduction',
      link: '/help/introduction',
    },
    {
      title: 'Login/Signup',
      link: '/help/authentication',
    },
    {
      title: 'Assets',
      link: '/help/assets',
    },
    {
      title: 'Node dashboard',
      link: '/help/node',
    },
    {
      title: 'Organization dashboard',
      link: '/help/organization',
    },
  ];

  constructor() { }
}
