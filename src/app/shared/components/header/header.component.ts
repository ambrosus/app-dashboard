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
    this.greeting = this.storage.get('full_name') || 'Hi, welcome!';
    this.isLoggedin = JSON.parse(this.storage.get('isLoggedin'));
  }
}
