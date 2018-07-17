import { Event } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

export interface BreadCrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: BreadCrumb[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const reloadUrl = window.location.pathname;
    this.buildCrumbs(reloadUrl);

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.breadcrumbs = [];
        const url = event.url;
        this.buildCrumbs(url);
      }
    });
  }

  buildCrumbs(u) {
    const url = u.split('/');
    url.shift();
    let currentPath = '/';

    url.map((path) => {
      currentPath += `${path}/`;
      if (!(path === 'events')) {
        this.breadcrumbs.push({
          label: path,
          url: currentPath
        });
      }
    });
  }
}
