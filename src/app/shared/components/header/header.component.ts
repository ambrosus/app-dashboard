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

  constructor(private auth: AuthService, private storage: StorageService) {}

  ngOnInit() {
    this.auth.loggedin.subscribe(resp => {
      this.isLoggedin = resp;
      console.log(resp);
    });
    this.greeting = this.storage.get('full_name') || this.storage.get('email') || 'Hi, welcome!';
    this.isLoggedin = this.storage.get('isLoggedin') || null ? true : false;
  }

  onLogout() {
    this.auth.logout();
  }
}
