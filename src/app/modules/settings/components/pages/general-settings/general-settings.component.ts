import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/services/auth.service';

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
  showCropper;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(private storage: StorageService, private http: HttpClient, private auth: AuthService) { }

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
    this.user = this.storage.get('user') || {};
    this.editProfileForm.get('full_name').setValue(this.user.full_name);
    let timeZone = '';
    try {
      timeZone = JSON.parse(this.user.settings)['timeZone'];
    } catch (err) { timeZone = this.storage.get('user')['company']['timeZone']; }
    this.editProfileForm.get('timeZone').setValue(timeZone);

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
          this.auth.getAccount(this.user.email).subscribe(
            user => {
              this.storage.set('user', user);
              this.emit('user:refresh');
            },
            err => {
              if (err.status === 401) { this.auth.logout(); }
              console.log('Get account error: ', err);
            }
          );
          console.log('Edit profile: ', resp);
        },
        err => {
          if (err.status === 401) { this.auth.logout(); }
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
