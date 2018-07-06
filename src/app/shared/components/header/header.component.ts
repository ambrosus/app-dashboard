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
  loggedin = false;
  email = 'Hi, welcome!';
  overlay = false;

  constructor(private auth: AuthService, private storage: StorageService) {}

  ngOnInit() {
    this.auth.loggedin.subscribe(resp => {
      this.loggedin = resp;
      console.log(resp);
    });
    this.email = this.storage.get('email') || 'Hi, welcome!';
  }

  onLogout() {
    this.auth.logout();
  }
}
