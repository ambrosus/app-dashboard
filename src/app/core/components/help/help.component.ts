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
      title: 'Getting started',
      link: '/help/getting-started',
    },
    {
      title: 'Logging into the account',
      link: '/help/logging-into-the-account',
    },
    {
      title: 'Editing personal account settings',
      link: '/help/editing-personal-account-settings',
    },
    {
      title: 'Editing organization details',
      link: '/help/editing-organization-details',
    },
    {
      title: 'Inviting users and managing accounts',
      link: '/help/inviting-users-and-managing-accounts',
    },
    {
      title: 'Viewing and creating assets',
      link: '/help/viewing-and-creating-assets',
    },
    {
      title: 'Viewing and creating events',
      link: '/help/viewing-and-creating-events',
    },
    {
      title: 'Searching for assets',
      link: '/help/searching-for-assets',
    },
    {
      title: 'Viewing organization statistics',
      link: '/help/viewing-organization-statistics',
    },
  ];

  constructor() { }
}
