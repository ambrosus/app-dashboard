import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'app/services/storage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

declare let moment: any;
declare let AmbrosusSDK: any;
declare let Web3: any;

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
  timezones = [];
  web3;
  success;

  constructor(private http: HttpClient,
    private router: Router,
    private storage: StorageService) {
    this.initSetupForm();
    this.web3 = new Web3();
  }

  initSetupForm() {
    this.setupForm = new FormGroup({
      hermesTitle: new FormControl('', [Validators.required]),
      hermesUrl: new FormControl('', [Validators.required]),
      companyTitle: new FormControl('', [Validators.required]),
      companyTimeZone: new FormControl('', [Validators.required]),
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

    this.timezones = moment.tz.names();
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
        this.stepCompany = companyTitle !== '' && companyTimeZone !== '';
        return this.stepCompany;
    }
  }

  setupReset() {
    this.error = null;
    this.success = null;
  }

  setup() {
    this.setupReset();
    const body: any = {
      hermes: {
        title: this.setupForm.get('hermesTitle').value,
        url: this.setupForm.get('hermesUrl').value
      },
      company: {
        title: this.setupForm.get('companyTitle').value,
        timeZone: this.setupForm.get('companyTimeZone').value
      },
      user: {
        full_name: this.setupForm.get('userFullName').value,
        email: this.setupForm.get('userEmail').value,
        password: this.setupForm.get('userPassword').value,
        passwordConfirm: this.setupForm.get('userPasswordConfirm').value
      }
    };

    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
    body.user['address'] = address;
    body.user['secret'] = privateKey;

    if (this.setupForm.valid) {
      if (!(body.user.password === body.user.passwordConfirm)) {
        this.error = 'Passwords do not match';
        return;
      }
      this.spinner = true;

      const url = `/api/setup`;

      this.http.post(url, body).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.success = `
            Setup was successfuly done.<br>
            Now you can login with your email and password.<br>
            But, before you go, this is your<br>
            <b>address: ${body.user.address}</b><br> and
            <b>secret: ${body.user.secret}</b>,<br> please <u>save them somewhere safe</u>,
            as we are not storing them anywhere for security reasons.
          `;
          console.log('Setup success: ', resp);
        },
        err => {
          this.spinner = false;
          this.error = err.error.message ? err.error.message : 'Setup error';
          console.log('Setup error: ', err);
        }
      );
    } else {
      this.error = 'All steps are required';
    }
  }
}
