/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Router, NavigationEnd } from '@angular/router';
import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  initialLoad = false;
  login;

  previousUrl: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
  ) {

    this.router.events.subscribe((e: any) => {

      if (e instanceof NavigationEnd) {

        window.scrollTo(0, 0);
        this.initialLoad = true;
        this.renderer.addClass(document.body, 'page-loaded');

        if (this.previousUrl) {
          this.renderer.removeClass(document.body, this.previousUrl);
        }

        const currentUrlSlug = this.router.url.slice(1);
        if (currentUrlSlug) {
          this.renderer.addClass(document.body, currentUrlSlug);
        }
        this.previousUrl = currentUrlSlug;
      }
    });
  }

  hideHeader() { return location.pathname === '/login' || location.pathname === '/signup'; }

  // Dropdown close on click outside of it
  @HostListener('click', ['$event'])
  onDocumentClick(e) {
    const dropdownParent = this.el.nativeElement.querySelectorAll('.dropdown');
    for (const element of dropdownParent) {
      if (element && !element.contains(e.target) && element.classList.contains('active')) {
        this.renderer.removeClass(element, 'active');
      }
    }
  }
}
