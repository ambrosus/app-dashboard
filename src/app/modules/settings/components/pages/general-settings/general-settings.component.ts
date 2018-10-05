import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import * as moment from 'moment-timezone';
import { UsersService } from 'app/services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {
  updateProfileForm: FormGroup;
  updateProfileSub: Subscription;
  getAccountSub: Subscription;
  error;
  success;
  spinner = false;
  user;
  timezones = [];
  showCropper;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(private storageService: StorageService, private authService: AuthService,
    private usersService: UsersService) { }

  ngOnInit() {
    this.updateProfileForm = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      timeZone: new FormControl('', []),
    });

    this.prefillupdateProfile();
    this.timezones = moment.tz.names();
  }

  ngOnDestroy() {
    if (this.updateProfileSub) { this.updateProfileSub.unsubscribe(); }
    if (this.getAccountSub) { this.getAccountSub.unsubscribe(); }
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(image: string) { this.croppedImage = image; }

  emit(type) { window.dispatchEvent(new Event(type)); }

  prefillupdateProfile() {
    this.user = this.storageService.get('user') || {};
    this.updateProfileForm.get('full_name').setValue(this.user.full_name);
    let companySettings: any = {};
    try { companySettings = JSON.parse(this.user.settings); } catch (e) { console.log(e); }
    this.updateProfileForm.get('timeZone').setValue(companySettings.timeZone);

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

  updateProfile() {
    this.resetForm();
    const data = this.updateProfileForm.value;
    const body = {
      full_name: data.full_name,
      settings: JSON.stringify({ timeZone: data.timeZone }),
      profile: {
        image: this.croppedImage,
      },
    };

    if (this.updateProfileForm.valid) {
      this.spinner = true;

      this.updateProfileSub = this.usersService.updateProfile(body).subscribe(
        resp => {
          this.spinner = false;
          this.success = 'Update successful!';
          this.getAccountSub = this.usersService.getUser(this.user.email).subscribe(
            user => {
              this.storageService.set('user', user);
              this.emit('user:refresh');
            },
            err => console.error('Account GET error: ', err)
          );
        },
        err => {
          this.spinner = false;
          this.error = err.message;
          console.error('Profile UPDATE error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
