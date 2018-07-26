import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdministrationService } from 'app/services/administration.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  previewAppForm: FormGroup;
  spinner = false;
  errorPreviewApp = false;
  successPreviewApp = false;

  constructor(private administration: AdministrationService) {
    this.initPreviewAppForm();
  }

  initPreviewAppForm() {
    this.previewAppForm = new FormGroup({
      url: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.prefillPreviewApp();
  }

  prefillPreviewApp() {
    // Current users API settings
    const previewAppForm = this.previewAppForm;
    previewAppForm.get('url').setValue(this.administration.previewAppUrl);
  }

  errorsResetPreviewApp() {
    this.errorPreviewApp = false;
  }

  previewAppSave() {
    const previewAppUrl = this.previewAppForm.get('url').value;
    // reset errors
    this.errorsResetPreviewApp();

    if (this.previewAppForm.valid) {
      this.spinner = true;
      console.log(previewAppUrl);
      this.administration.previewAppUrl = previewAppUrl;

      setTimeout(() => {
        this.spinner = false;
        this.successPreviewApp = true;
        setTimeout(() => {
          this.successPreviewApp = false;
        }, 1500);
      }, 1500);
    } else {
      this.errorPreviewApp = true;
    }
  }
}
