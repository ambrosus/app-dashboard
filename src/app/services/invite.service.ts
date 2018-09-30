import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class InviteService {

  constructor(private http: HttpClient) { }

  validateInvite(token) {
    const url = `/api/invites/verify/${token}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        (resp: any) => { observer.next(resp); },
        err => { observer.error(err); }
      );
    });

  }

  getInvites(user) {
    const url = `/api/invites/company/${user.company._id}`;

    return new Observable(observer => {
        this.http.get(url).subscribe(
          (resp: any) => { observer.next(resp); },
          err => { observer.error(err); }
        );
    });
  }

  revokeInvites(ids) {
    const url = `/api/invites/delete`;

    return new Observable(observer => {
      this.http.post(url, { ids }).subscribe(
        (resp: any) => { observer.next(resp); },
        err => { observer.error(err); }
      );
    });

  }

}
