import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  constructor() {
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
    previewAppForm.get('url').setValue('https://amb.to');
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
