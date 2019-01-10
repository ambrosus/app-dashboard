import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { OrganizationsService } from 'app/services/organizations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as moment from 'moment-timezone';
import { MessageService } from 'app/services/message.service';
import { checkTimeZone, checkText } from 'app/util';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    organization?: FormGroup;
  } = {};
  organization: any = {};
  organizationId;
  timezones = [];
  promise: any = {};

  constructor(
    private organizationsService: OrganizationsService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.subs[this.subs.length] = this.route.params.subscribe(params => this.organizationId = params.organizationId);
    this.getOrganization().then();
    this.timezones = moment.tz.names();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  initForm() {
    this.forms.organization = new FormGroup({
      title: new FormControl(this.organization.title, [checkText(false)]),
      legalAddress: new FormControl(this.organization.legalAddress, [checkText(false, true)]),
      owner: new FormControl({
        value: this.organization.owner,
        disabled: true,
      }),
      timeZone: new FormControl(this.organization.timeZone, [checkTimeZone(false)]),
      active: new FormControl(this.organization.active),
    });
  }

  async getOrganization(): Promise<any> {
    try {
      this.organization = await this.organizationsService.getOrganization(this.organizationId);
      console.log('[GET] Organization: ', this.organization);
      this.initForm();
    } catch (e) {
      this.router.navigate(['/node/organizations']);
    }
  }

  save() {
    this.promise['save'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.organization;
        const data = form.value;
        const body = { active: data.active };

        if (form.invalid) {
          throw new Error('Form is invalid');
        }

        Object.keys(data).map(prop => {
          if (data[prop] && (data[prop] !== this.organization[prop])) {
            body[prop] = data[prop];
          }
        });
        console.log('(Node organization settings) body: ', body);

        const organization = await this.organizationsService.modifyOrganization(this.organizationId, body);
        await this.getOrganization();

        this.messageService.success('Organization updated');

        resolve();
      } catch (error) {
        console.error('[MODIFY] Organization: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }
}
