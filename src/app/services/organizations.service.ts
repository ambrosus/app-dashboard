import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

export class OrganizationsService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  checkOrganization(query) {
    return new Observable(observer => {
      let url = `/api/organizations/check?`;
      Object.keys(query).map(key => url += `${key}=${query[key]}&`);

      this.http.get(url).subscribe(
        res => observer.next(res),
        err => observer.error(err.error)
      );
    });
  }

  editOrganization(body) {
    const organizationID = this.storageService.get('user')['organization']['_id'] || null;
    const url = `/api/organizations/${organizationID}`;

    return new Observable(observer => {
      this.http.put(url, body).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });
  }
}
