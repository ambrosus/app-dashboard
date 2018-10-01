import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class HelpService {

  constructor(private http: HttpClient) { }

  get(category, question) {
    const url = `/assets/help/pages/${category}/${question}.html`;

    return new Observable(observer => {
      this.http.get(url, { responseType: 'text' }).subscribe(
        (page: any) => { observer.next(page); },
        err => { observer.error(err); }
      );
    });

  }

}
