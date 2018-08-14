import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  isLoggedin = false;
  greeting = 'Hi, welcome!';
  overlay = false;
  accounts;
  currentAccount;
  addAccount;
  public opened: Boolean = true;
  navigationSubscription;
  assetsActive: Boolean;
  usersActive: Boolean;
  settingsActive: Boolean;

  constructor(
    private auth: AuthService,
    private storage: StorageService,
    private router: Router
  ) {
    this.auth.accountsAction.subscribe(resp => {
      this.headerInit();
    });
  }

  ngOnInit() {
    this.headerInit();
  }

  headerInit() {
    this.greeting = this.storage.get('full_name') || 'Hi, welcome!';
    this.isLoggedin = JSON.parse(this.storage.get('isLoggedin'));
    const accounts = this.storage.get('accounts');
    this.accounts = accounts ? JSON.parse(accounts) : [];
    this.currentAccount = this.accounts[0];
  }

  switchAccount(address) {
    this.auth.switchAccount(address);
  }

  logout() {
    this.auth.logout();
  }

  logoutAll() {
    this.auth.logoutAll();
  }

  public close(status) {
    console.log(`Dialog result: ${status}`);
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }
}
