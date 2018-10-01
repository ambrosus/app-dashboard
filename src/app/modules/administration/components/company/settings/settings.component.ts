import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import * as moment from 'moment-timezone';
import { CompaniesService } from 'app/services/companies.service';

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

  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private companiesService: CompaniesService
  ) { }

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
    this.user = this.storageService.get('user') || {};
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
    const data = this.settingsForm.value;
    const body = {
      title: data.title,
      settings: JSON.stringify({
        preview_app: data.preview_app,
        timeZone: data.timeZone,
        logo: this.croppedImage,
      }),
    };

    if (this.settingsForm.valid) {
      this.spinner = true;

      this.companiesService.editCompany(body).subscribe(
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
          console.log('Edit company: ', resp);
        },
        err => {
          if (err.status === 401) { this.authService.logout(); }
          this.spinner = false;
          this.error = err.message;
          console.log('Edit company error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
