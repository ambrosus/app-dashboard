import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'app/services/storage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-hermesregister',
  templateUrl: './hermesregister.component.html',
  styleUrls: ['./hermesregister.component.scss']
})
export class HermesregisterComponent implements OnInit {
  hermesForm: FormGroup;
  error;
  spinner = false;

  constructor(private http: HttpClient,
              private router: Router,
              private storage: StorageService) {
    this.hermesForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      url: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {
    const url = `/api/hermeses`;

    this.http.get(url).subscribe(
      (resp: any) => {
        if (resp.resultCount > 0) {
          this.storage.set('hermes', resp.data[0]);
          this.router.navigate(['/login']);
        }
      },
      err => {
        console.log('Hermes GET error: ', err);
        this.router.navigate(['/login']);
      }
    );
  }

  create() {
    const title = this.hermesForm.get('title').value;
    const url = this.hermesForm.get('url').value;

    if (this.hermesForm.valid) {
      const body = {
        title,
        url
      };

      const _url = `/api/hermeses`;

      this.http.post(_url, body).subscribe(
        (resp: any) => {
          this.storage.set('hermes', resp.data);
          this.router.navigate(['/login']);
        },
        err => {
          this.spinner = false;
          this.error = err.error.message ? err.error.message : 'Hermes creation error';
          console.log('Hermes register error: ', err);
        }
      );
    } else {
      this.error = 'All fields are required';
    }
  }
}
