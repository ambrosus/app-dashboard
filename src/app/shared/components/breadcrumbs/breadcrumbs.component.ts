import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ActivatedRoute, Event, NavigationStart } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const reloadUrl = window.location.pathname;
    this.buildCrumbs(reloadUrl);

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.breadcrumbs = [];
        const url = event.url;
        this.buildCrumbs(url);
      }
    });
  }

  buildCrumbs(url) {
    if (url.startsWith('/')) {
      this.breadcrumbs.push({
        label: 'Home',
        url: '/'
      });
    }
    if (url.startsWith('/assets')) {
      this.breadcrumbs.push({
        label: 'Assets',
        url: '/assets'
      });
    }
    if (url.startsWith('/assets/new')) {
      this.breadcrumbs.push({
        label: 'Assets new',
        url: '/assets/new'
      });
    }
    if (url.startsWith('/settings')) {
      this.breadcrumbs.push({
        label: 'Settings',
        url: '/settings'
      });
    }
    /* const exists = this.breadcrumbs.some(breadcrumb => {
      return breadcrumb.url === url;
    }); */
    const lastPart = url.substr(url.lastIndexOf('/') + 1);
    if (lastPart.length > 10) {
      this.breadcrumbs.push({
        label: lastPart,
        url: lastPart
      });
    }
  }
}
