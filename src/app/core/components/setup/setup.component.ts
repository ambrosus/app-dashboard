import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'app/services/storage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetupComponent implements OnInit {
  setupForm: FormGroup;
  error;
  spinner = false;
  stepHermes;
  stepCompany;
  stepUser;
  currentStep = 1;
  prevButton = '';
  nextButton = 'Company';

  constructor(private http: HttpClient,
              private router: Router,
              private storage: StorageService) {
    this.initSetupForm();
  }

  initSetupForm() {
    this.setupForm = new FormGroup({
      hermesTitle: new FormControl('', [Validators.required]),
      hermesUrl: new FormControl('', [Validators.required]),
      companyTitle: new FormControl('', [Validators.required]),
      companyTimeZone: new FormControl(0, [Validators.required]),
      userFullName: new FormControl('', [Validators.required]),
      userEmail: new FormControl('', [Validators.required]),
      userPassword: new FormControl('', [Validators.required]),
      userPasswordConfirm: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    const url = `/api/hermeses`;

    this.http.get(url).subscribe(
      (resp: any) => {
        if (resp.resultCount > 0) {
          this.storage.set('hermes', resp.data[0]);
          this.router.navigate(['/login']);
        }
      },
      err => {
        console.log('Hermes GET error: ', err);
        this.router.navigate(['/login']);
      }
    );
  }

  changeStep(type) {
    switch (this.currentStep) {
      case 1:
        if (type && this.stepHermes) {
          this.currentStep++;
          this.prevButton = 'Hermes Node';
          this.nextButton = 'User';
        }
        break;
      case 2:
        if (type === 'prev') {
          this.currentStep--;
          this.nextButton = 'Company';
        } else if (this.stepCompany) {
          this.currentStep++;
          this.prevButton = 'Company';
        }
        break;
      case 3:
        if (type) {
          this.currentStep--;
          this.prevButton = 'Hermes Node';
          this.nextButton = 'User';
        }
      }
  }

  checkStep() {
    switch (this.currentStep) {
      case 1:
        const hermesTitle = this.setupForm.get('hermesTitle').value;
        const hermesUrl = this.setupForm.get('hermesUrl').value;
        this.stepHermes = hermesTitle !== '' && hermesUrl !== '';
        return this.stepHermes;
      case 2:
        const companyTitle = this.setupForm.get('companyTitle').value;
        const companyTimeZone = this.setupForm.get('companyTimeZone').value;
        this.stepCompany = companyTitle !== '' && (companyTimeZone !== '' || companyTimeZone === 0);
        return this.stepCompany;
    }
  }

  setupReset() {
    this.error = null;
  }

  setup() {
    this.setupReset();

    const hermesTitle = this.setupForm.get('hermesTitle').value;
    const hermesUrl = this.setupForm.get('hermesUrl').value;
    const companyTitle = this.setupForm.get('companyTitle').value;
    const companyTimeZone = this.setupForm.get('companyTimeZone').value;
    const userFullName = this.setupForm.get('userFullName').value;
    const userEmail = this.setupForm.get('userEmail').value;
    const userPassword = this.setupForm.get('userPassword').value;
    const userPasswordConfirm = this.setupForm.get('userPasswordConfirm').value;

    if (this.setupForm.valid) {
      if (!(userPassword === userPasswordConfirm)) {
        this.error = 'Passwords do not match';
        return;
      }

      console.log('Yes');
      return;

      // Make a request

      // const body = {
      //   title,
      //   url
      // };

      // const _url = `/api/hermeses`;

      // this.http.post(_url, body).subscribe(
      //   (resp: any) => {
      //     this.storage.set('hermes', resp.data);
      //     this.router.navigate(['/login']);
      //   },
      //   err => {
      //     this.spinner = false;
      //     this.error = err.error.message ? err.error.message : 'Hermes creation error';
      //     console.log('Hermes register error: ', err);
      //   }
      // );
    } else {
      this.error = 'All steps are required';
    }
  }
}
