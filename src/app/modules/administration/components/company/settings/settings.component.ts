import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import * as moment from 'moment-timezone';
import { CompaniesService } from 'app/services/companies.service';
import { UsersService } from 'app/services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  editCompanySub: Subscription;
  userGetSub: Subscription;
  spinner;
  error;
  success;
  timezones = [];
  showCropper;
  user;
  company;
  settings;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private companiesService: CompaniesService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.initSettingsForm();

    this.timezones = moment.tz.names();
  }

  ngOnDestroy() {
    if (this.editCompanySub) { this.editCompanySub.unsubscribe(); }
    if (this.userGetSub) { this.userGetSub.unsubscribe(); }
  }

  initSettingsForm() {
    this.user = this.storageService.get('user') || {};
    this.company = this.user['company'] || {};

    this.settingsForm = new FormGroup({
      title: new FormControl(this.company.title, [Validators.required]),
      preview_app: new FormControl(this.company.settings['preview_app'], []),
      timeZone: new FormControl(this.company.settings['timeZone'], []),
    });

    this.croppedImage = this.company.settings['logo'] || '';
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(image: string) { this.croppedImage = image; }

  emit(type) { window.dispatchEvent(new Event(type)); }

  editCompany() {
    this.error = null;
    this.success = null;
    this.showCropper = null;
    const data = this.settingsForm.value;
    const body = {
      title: data.title,
      settings: {
        preview_app: data.preview_app,
        timeZone: data.timeZone,
        logo: this.croppedImage,
      },
    };

    if (this.settingsForm.valid) {
      this.spinner = true;

      this.editCompanySub = this.companiesService.editCompany(body).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.success = 'Settings update success';
          this.userGetSub = this.usersService.getUser(this.user.email).subscribe(
            user => {
              this.storageService.set('user', user);
              this.emit('user:refresh');
            },
            err => console.error('Account GET error: ', err)
          );
          console.log('Company UPDATE success: ', resp);
        },
        err => {
          this.spinner = false;
          this.error = err.message;
          console.error('Company UPDATE error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
