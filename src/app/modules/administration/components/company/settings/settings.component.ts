import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdministrationService } from 'app/services/administration.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  spinner = false;
  error;
  success = false;

  constructor(private administration: AdministrationService) {
    this.initSettingsForm();
  }

  initSettingsForm() {
    this.settingsForm = new FormGroup({
      url: new FormControl('', [Validators.required]),
      logo: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.prefillSettings();
  }

  prefillSettings() {
    // Current users API settings
    this.settingsForm.get('url').setValue(this.administration.previewAppUrl);
    this.settingsForm.get('logo').setValue(this.administration.companyLogo);
  }

  errorsReset() {
    this.error = false;
  }

  save() {
    const previewApp = this.settingsForm.get('url').value;
    const logo = this.settingsForm.get('logo').value;
    this.errorsReset();

    if (this.settingsForm.valid) {
      this.spinner = true;
      this.administration.previewAppUrl = previewApp;
      this.administration.companyLogo = logo;

      setTimeout(() => {
        this.spinner = false;
        this.success = true;
        setTimeout(() => {
          this.success = false;
        }, 1500);
      }, 1500);
    } else {
      this.error = 'All fields are required';
    }
  }
}
