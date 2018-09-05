import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './../../../../../services/storage.service';

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss']
})
export class SecuritySettingsComponent implements OnInit {

  sessions;
  spinner: Boolean = true;

  constructor(private http: HttpClient, private storage: StorageService) { }

  ngOnInit() {
    const email = this.storage.get('user')['email'];
    this.http.get(`/api/auth/sessions/${email}`).subscribe(
      resp => {
        console.log(resp);
        this.sessions = resp;
        this.spinner = false;
      },
      err => {
        console.log(err);
      }
    );
  }

  logoutSession(sessionId) {
    this.http.delete(`/api/auth/session/${sessionId}`).subscribe(
      resp => {
        this.ngOnInit();
      },
      err => {
        console.log(err);
      }
    );
  }

}
