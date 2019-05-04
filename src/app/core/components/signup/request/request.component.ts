/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
