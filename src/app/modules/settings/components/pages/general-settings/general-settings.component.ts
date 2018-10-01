import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/services/auth.service';
import * as moment from 'moment-timezone';

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
  showCropper;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(private storageService: StorageService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.editProfileForm = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      timeZone: new FormControl('', [])
    });

    this.prefillEditProfile();
    this.timezones = moment.tz.names();
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(image: string) {
    this.croppedImage = image;
  }

  emit(type) {
    window.dispatchEvent(new Event(type));
  }

  prefillEditProfile() {
    this.user = this.storageService.get('user') || {};
    this.editProfileForm.get('full_name').setValue(this.user.full_name);
    let companySettings: any = {};
    try { companySettings = JSON.parse(this.user.settings); } catch (e) { console.log(e); }
    this.editProfileForm.get('timeZone').setValue(companySettings.timeZone);

    try {
      this.croppedImage = this.user.profile.image;
    } catch (e) {
      this.croppedImage = '';
    }
  }

  resetForm() {
    this.error = false;
    this.success = false;
    this.showCropper = false;
  }

  editProfile() {
    this.resetForm();
    const body = {
      full_name: this.editProfileForm.get('full_name').value,
      settings: JSON.stringify({ timeZone: this.editProfileForm.get('timeZone').value }),
      profile: {
        image: this.croppedImage
      }
    };

    if (this.editProfileForm.valid) {
      this.spinner = true;

      const url = `/api/users/${this.user.email}?address=${this.user.address}`;
      this.http.put(url, body).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.success = true;
          this.authService.getAccount(this.user.email).subscribe(
            user => {
              this.storageService.set('user', user);
              this.emit('user:refresh');
            },
            err => {
              if (err.status === 401) { this.authService.logout(); }
              console.log('Get account error: ', err);
            }
          );
          console.log('Edit profile: ', resp);
        },
        err => {
          if (err.status === 401) { this.authService.logout(); }
          this.spinner = false;
          this.error = err.error.message && Object.keys(err.error.message).length ? err.error.message : err.statusText;
          console.log('Edit profile error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
