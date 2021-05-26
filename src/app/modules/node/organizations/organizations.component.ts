import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { OrganizationsService } from 'app/services/organizations.service';
import * as moment from 'moment-timezone';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { environment } from '../../../../environments/environment.prod';
import { MessageService } from 'app/services/message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { download } from 'app/util';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  organizations = [];
  organizationsDisabled = [];
  organizationRequests = [];
  organizationRequestsDeclined = [];
  account: any = {};
  show = 'all';
  self = this;
  api;

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
    private messageService: MessageService,
    private http: HttpClient,
  ) { this.api = environment.api; }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.actions = this.actions.bind(this);
    this.getOrganizations().then();
    this.getOrganizationRequests().then();
    this.getOrganizationRequestsDeclined().then();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  async getOrganizations(next = ''): Promise<any> {
    try {
      const organizations = await this.organizationsService.getOrganizations(next);
      this.organizations = organizations.filter(organization => {
        organization.createdOn = moment.tz(organization.createdOn * 1000, this.account.timeZone || 'UTC').fromNow();
        // downloadJSON(organizationId)
        return organization.active;
      });
      this.organizationsDisabled = organizations.filter(organization => !organization.active);
      console.log('[GET] Organizations: ', this.organizations);
      console.log('[GET] Organizations disabled: ', this.organizationsDisabled);

    } catch (error) {
      console.error('[GET] Organizations: ', error);
      this.messageService.error(error);
    }
  }

  async getOrganizationRequests(next = ''): Promise<any> {
    try {
      this.organizationRequests = await this.organizationsService.getOrganizationRequests(next);
      this.organizationRequests = this.organizationRequests.filter(organizationRequest => {
        organizationRequest.createdOn = moment.tz(organizationRequest.createdOn * 1000, this.account.timeZone || 'UTC')
          .fromNow();
        return organizationRequest;
      });
      console.log('[GET] Organization requests: ', this.organizationRequests);
    } catch (error) {
      console.error('[GET] Organization requests: ', error);
      this.messageService.error(error);
    }
  }

  async getOrganizationRequestsDeclined(next = ''): Promise<any> {
    try {
      this.organizationRequestsDeclined = await this.organizationsService.getOrganizationRequestsDeclined(next);
      this.organizationRequestsDeclined = this.organizationRequestsDeclined.filter(organizationRequest => {
        organizationRequest.createdOn = moment.tz(organizationRequest.createdOn * 1000, this.account.timeZone || 'UTC')
          .fromNow();
        return organizationRequest;
      });
      console.log('[GET] Organization requests declined: ', this.organizationRequestsDeclined);
    } catch (error) {
      console.error('[GET] Organization requests declined: ', error);
      this.messageService.error(error);
    }
  }

  async actions(...args): Promise<any> {
    switch (args[0]) {
      case 'organizationModify':
        try {
          console.log('modify');
          await this.organizationsService.modifyOrganization(args[1].id, args[1].data);
          await this.getOrganizations();

          this.messageService.success('Organization modified');
        } catch (error) {
          console.error('[MODIFY] Organization: ', error);
          this.messageService.error(error);
        }
        break;
      case 'organizationBackup':
        const organizationId = args[1].id
        this.backupJSON(organizationId)
        // try {
        //   console.log('backup');
        //   await this.organizationsService.backupOrganization(args[1].id);

        //   this.messageService.success('Organization backuped');
        // } catch (error) {
        //   console.error('[BACKUP] Organization: ', error);
        //   this.messageService.error(error);
        // }
        break;
      case 'organizationRequest':
        try {
          await this.organizationsService.handleOrganizationRequest(args[1].id, args[1].approved);
          await this.getOrganizations();
          await this.getOrganizationRequests();
          await this.getOrganizationRequestsDeclined();

          this.messageService.success(`Organization request ${args[1].approved ? 'approved' : 'declined'}`);
        } catch (error) {
          console.error('[HANDLE] Organization request: ', error);
          this.messageService.error(error);
        }
        break;
    }
  }
  
  backupJSON(organizationId) {
    console.log("THIS IS TEST!!!")

    // const url = `${this.api.extended}/bundle2/push`;
    const url = `${this.api.extended}/organization2/backup/${organizationId}`; 

    // const body = {};
    const token = this.storageService.get('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `AMB_TOKEN ${token}`,
        'Accept': 'application/json',
      }),
    };

    httpOptions.headers = httpOptions.headers.set('Authorization', `AMB_TOKEN ${token}`);
    httpOptions.headers = httpOptions.headers.set('Accept', 'application/json');
    
    try {
      if (organizationId !== 0) {
      this.http.get(url, httpOptions).subscribe((responseData) => {
          const data = responseData['data']
          const test = this.http.get(url, httpOptions).subscribe()
          console.log(responseData, 'realData:', data, 'test:', test)
          if (data.data) download.bind(this)('Backup.json', data)
          else console.log("No data received!")
        })} else { 
          // const test = this.http.get(url, httpOptions).subscribe()
          const test = this.http.get(url, httpOptions)
          console.log("400 error: ", test)
         }
      } catch(error) {
        console.log(error)
      }
    // await this.to(this.http.post(url, body, httpOptions)).then(() => this.popUpIsOpen = false);
  }
}
