/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Component, ElementRef, HostListener, Renderer2, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from './services/storage.service';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './core/components/login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  navigationSub: Subscription;
  initialLoad = false;
  _opened: Boolean = false;

  isLoggedin;
  greeting = 'Hi, welcome!';
  overlay = false;
  users;
  user;
  profile_image;
  addAccount;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.navigationSub = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.initialLoad = true;
      }
    });
  }

  ngOnInit() {
    this.headerInit();
    window.addEventListener('user:refresh', () => this.headerInit());
  }

  public _toggleOpened() { this._opened = !this._opened; }

  hideHeader() { return location.pathname === '/login' || location.pathname === '/setup'; }

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

  headerInit() {
    this.user = this.storageService.get('user') || {};
    this.greeting = this.user.full_name || this.user.email || 'Hi, welcome!';
    this.profile_image = '';

    if (this.user && this.user.profile && this.user.profile.image) {
      this.profile_image = this.sanitizer.bypassSecurityTrustStyle(`url(${this.user.profile.image || ''})`);
    }

    this.isLoggedin = this.authService.isLoggedIn();
    this.users = this.storageService.get('accounts') || [];
    this.dialog.closeAll();
  }

  switchAccount(address) { this.authService.switchAccount(address); }

  logout() { this.authService.logout(); }

  logoutAll() { this.authService.logoutAll(); }

  addAccountDialog() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '600px',
      position: { right: '0' },
      height: '100vh',
    });

    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }
}
