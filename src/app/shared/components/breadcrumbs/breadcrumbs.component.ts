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
    /* if (url.startsWith('/')) {
      this.breadcrumbs.push({
        label: 'Home',
        url: '/'
      });
    } */
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
    if (url.startsWith('/about')) {
      this.breadcrumbs.push({
        label: 'About',
        url: '/about'
      });
    }
    if (url.startsWith('/help')) {
      this.breadcrumbs.push({
        label: 'Help',
        url: '/help'
      });
    }
    if (url.startsWith('/terms')) {
      this.breadcrumbs.push({
        label: 'Terms of use',
        url: '/terms'
      });
    }
    if (!url.includes('/events')) {
      const assetId = url.substr(url.lastIndexOf('/') + 1);
      if (assetId.length > 30) {
        this.breadcrumbs.push({
          label: assetId,
          url: assetId
        });
      }
    } else {
      const ids = url.split('/');
      this.breadcrumbs.push({
        label: ids[2],
        url: ids[2]
      });
      this.breadcrumbs.push({
        label: `event: ${ids[ids.length - 1]}`,
        url: ids[ids.length - 1]
      });
    }
  }
}
