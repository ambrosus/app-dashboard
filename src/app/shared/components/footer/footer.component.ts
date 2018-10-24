import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FooterComponent implements OnInit {

  socials: {
    url: string,
    icon: string
  }[];

  constructor() {
    this.socials = [
      {
        url: 'https://www.facebook.com/ambrosusAMB',
        icon: 'facebook',
      },
      {
        url: 'https://www.youtube.com/channel/UC27wKQU7KBgvtuTAOKD0BJg',
        icon: 'youtube',
      },
      {
        url: 'https://twitter.com/AmbrosusAMB',
        icon: 'twitter',
      },
    ];
  }

  ngOnInit() { }
}
