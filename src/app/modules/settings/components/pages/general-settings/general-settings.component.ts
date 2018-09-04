import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';

declare let moment: any;

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  editProfileForm: FormGroup;
  error;
  success;
  spinner = false;
  user;
  timezones = [];

  constructor(private storage: StorageService, private http: HttpClient) { }

  ngOnInit() {
    this.editProfileForm = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      timeZone: new FormControl('', [])
    });

    this.prefillEditProfile();
    this.timezones = moment.tz.names();
  }

  prefillEditProfile() {
    this.user = this.storage.get('user') || {};

    this.editProfileForm.get('full_name').setValue(this.user.full_name);
    this.editProfileForm.get('timeZone').setValue(this.user.settings ? this.user.settings.timeZone || '' : '');
  }

  resetForm() {
    this.error = false;
    this.success = false;
  }

  editProfile() {
    this.resetForm();
    const body = {
      full_name: this.editProfileForm.get('full_name').value,
      settings: JSON.stringify({ timeZone: this.editProfileForm.get('timeZone').value }),
      profile: {
        image: ''
      }
    };

    if (this.editProfileForm.valid) {
      this.spinner = true;

      const url = `/api/users/${this.user.email}`;
      this.http.post(url, body).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.success = true;
          console.log('Edit profile: ', resp);
        },
        err => {
          this.spinner = false;
          this.error = err.error.message ? err.error.message : 'Edit profile error';
          console.log('Edit profile error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
