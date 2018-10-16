import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

export class CompaniesService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  checkCompany(query) {
    return new Observable(observer => {
      let url = `/api/companies/check?`;
      Object.keys(query).map(key => url += `${key}=${query[key]}&`);

      this.http.get(url).subscribe(
        res => observer.next(res),
        err => observer.error(err.error)
      );
    });
  }

  editCompany(body) {
    const { _id } = <any>this.storageService.get('user')['company'] || { _id: '' };
    const url = `/api/companies?company=${_id}`;

    return new Observable(observer => {
      this.http.put(url, body).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });
  }
}
