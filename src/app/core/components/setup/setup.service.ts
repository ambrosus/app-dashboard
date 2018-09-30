import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class SetupService {

  constructor(private http: HttpClient) { }

  post (body) {
    const url = `/api/setup`;
    return new Observable(observer => {
      this.http.get(url).subscribe(
        (resp: any) => { observer.next(resp); },
        err => { observer.error(err); }
      );
    });

  }

}
