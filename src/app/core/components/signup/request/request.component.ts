import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrganizationsService } from 'app/services/organizations.service';
import { MessageService } from 'app/services/message.service';
import { AuthService } from 'app/services/auth.service';
import { checkText, checkEmail } from 'app/util';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RequestComponent implements OnInit, OnDestroy {
  forms: {
    request?: FormGroup;
  } = {};
  promise: any = {};
  step = 'request';

  constructor(
    private organizationsService: OrganizationsService,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    if (!this.authService.signupAddress) {
      this.router.navigate(['/signup']);
    }

    this.forms.request = new FormGroup({
      title: new FormControl('', [checkText()]),
      email: new FormControl('', [checkEmail(false)]),
      message: new FormControl('', [Validators.required]),
      terms: new FormControl('', [Validators.requiredTrue]),
    });
  }

  ngOnDestroy() {
    this.authService.signupAddress = '';
  }

  async requestOrganization(): Promise<any> {
    this.promise['request'] = new Promise(async (resolve, reject) => {
      try {
        const address = this.authService.signupAddress;
        const form = this.forms.request;
        const { title, email, message } = form.getRawValue();
        const body: any = {
          address,
          email,
          message,
        };
        if (title && title.trim()) {
          body.title = title;
        }

        if (form.invalid) {
          throw new Error('Please fill all required fields');
        }

        const organizationRequest = await this.organizationsService.createOrganizationRequest(body);
        console.log('[REQUEST] Organization: ', organizationRequest);
        this.authService.signupAddress = '';
        this.step = 'success';
        resolve();
      } catch (error) {
        console.error('[REQUEST] Organization: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }
}
