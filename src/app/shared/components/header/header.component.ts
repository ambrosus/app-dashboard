import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';

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

  constructor(
    private auth: AuthService,
    private storage: StorageService
  ) {
    this.auth.accountsAction.subscribe(resp => {
      this.headerInit();
    });
  }

  ngOnInit() {
    window.addEventListener('user:loggedin', () => {
      this.headerInit();
      console.log('This is it!');
    });
    this.headerInit();
  }

  headerInit() {
    const user: any = this.storage.get('user') || {};
    this.greeting = user.full_name || user.email || 'Hi, welcome!';
    this.isLoggedin = <any>this.storage.get('isLoggedin');
    this.accounts = this.storage.get('accounts') || [];
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
