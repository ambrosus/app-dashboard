import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/services/auth.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  spinner = false;
  error;
  success = false;
  timezones = [];
  showCropper;
  user;
  company;
  settings;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(private storage: StorageService, private http: HttpClient, private auth: AuthService) { }

  ngOnInit() {
    this.initSettingsForm();

    this.prefillSettings();
    this.timezones = moment.tz.names();
  }

  initSettingsForm() {
    this.settingsForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      preview_app: new FormControl('', []),
      timeZone: new FormControl('', []),
    });
  }

  prefillSettings() {
    this.user = this.storage.get('user') || {};
    this.company = this.user['company'] || {};
    try {
      this.settings = JSON.parse(this.company.settings);
    } catch (e) { }

    this.settingsForm.get('title').setValue(this.company['title']);
    this.settingsForm.get('preview_app').setValue(this.settings['preview_app']);
    this.settingsForm.get('timeZone').setValue(this.settings['timeZone']);
    this.croppedImage = this.settings['logo'] || '';
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

  resetForm() {
    this.error = false;
    this.success = false;
    this.showCropper = false;
  }

  editCompany() {
    this.resetForm();
    const body = {
      title: this.settingsForm.get('title').value,
      settings: JSON.stringify({
        preview_app: this.settingsForm.get('preview_app').value,
        timeZone: this.settingsForm.get('timeZone').value,
        logo: this.croppedImage,
      }),
    };

    if (this.settingsForm.valid) {
      this.spinner = true;

      const url = `/api/companies`;
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
          console.log('Edit company: ', resp);
        },
        err => {
          if (err.status === 401) { this.auth.logout(); }
          this.spinner = false;
          this.error = err.error.message && Object.keys(err.error.message).length ? err.error.message : err.statusText;
          console.log('Edit company error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
