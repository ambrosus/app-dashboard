import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  loggedin: boolean = false;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.auth.loggedin.subscribe(
      resp => {
        this.loggedin = resp;
      }
    )
  }

  logout() {
    this.auth.logout();
  }

}
