import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class CompaniesService {

  constructor(private http: HttpClient) { }

  editCompany(body) {
    const url = `/api/companies`;

    return new Observable(observer => {
      this.http.put(url, body).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });
  }
}
