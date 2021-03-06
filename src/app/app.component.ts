/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.io
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Router, NavigationEnd } from '@angular/router';
import { Component, Renderer2 } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { environment } from 'environments/environment.prod';
import { RequestService } from './services/request.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  initialLoad = false;
  previousUrl: string;
  loading = false;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private requestService: RequestService,
  ) {
    if (!environment.dev) {
      console.log = function () { };
      console.error = function () { };
    }

    this.requestService.request.start.subscribe(next => {
      if (!this.loading) {
        this.loading = true;
      }
    });

    this.requestService.request.done.subscribe(next => {
      if (this.loading) {
        this.loading = false;
      }
    });

    this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.initialLoad = true;
        this.renderer.addClass(document.body, 'page-loaded');

        if (this.previousUrl) {
          this.renderer.removeClass(document.body, this.previousUrl);
        }

        const currentLocation = location.pathname.split('/');
        let currentUrlSlug = currentLocation[1];
        currentUrlSlug = currentUrlSlug === 'dashboard' ? currentLocation[2] : currentLocation[1];
        if (currentUrlSlug) {
          this.renderer.addClass(document.body, currentUrlSlug);
        }
        this.previousUrl = currentUrlSlug;
      }
    });
  }

  hideHeader() {
    return (
      location.pathname.indexOf('/login') > -1 ||
      location.pathname.indexOf('/signup') > -1
    );
  }
}
