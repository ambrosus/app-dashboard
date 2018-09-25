import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {

  menu;

  constructor() {
    this.menu = [
      {
        title: 'Help',
        url: '/help'
      },
      {
        title: 'About',
        url: '/about'
      },{
        title: 'Terms and Conditions',
        url: '/terms'
      }
    ]
  }

  ngOnInit() { }
}
