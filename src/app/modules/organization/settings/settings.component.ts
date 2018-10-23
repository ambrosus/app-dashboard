import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import * as moment from 'moment-timezone';
import { OrganizationsService } from 'app/services/organizations.service';
import { UsersService } from 'app/services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  editOrganizationSub: Subscription;
  userGetSub: Subscription;
  spinner;
  error;
  success;
  timezones = [];
  showCropper;
  user;
  organization;
  settings;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private organizationsService: OrganizationsService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.initSettingsForm();

    this.timezones = moment.tz.names();
  }

  ngOnDestroy() {
    if (this.editOrganizationSub) { this.editOrganizationSub.unsubscribe(); }
    if (this.userGetSub) { this.userGetSub.unsubscribe(); }
  }

  initSettingsForm() {
    this.user = this.storageService.get('user') || {};
    this.organization = this.user['organization'] || {};

    this.settingsForm = new FormGroup({
      title: new FormControl(this.organization.title, [Validators.required]),
      preview_app: new FormControl(this.organization.settings['preview_app'], []),
      timeZone: new FormControl(this.organization.settings['timeZone'], []),
    });

    this.croppedImage = this.organization.settings['logo'] || '';
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(image: string) { this.croppedImage = image; }

  emit(type) { window.dispatchEvent(new Event(type)); }

  editOrganization() {
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

      this.editOrganizationSub = this.organizationsService.editOrganization(body).subscribe(
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
          console.log('Organization UPDATE success: ', resp);
        },
        err => {
          this.spinner = false;
          this.error = err.message;
          console.error('Organization UPDATE error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
