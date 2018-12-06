import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  api: any;

  constructor(
    private http: HttpClient,
  ) {
    this.api = environment.api;
  }

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => response)
      .catch(error => ({ error }));
  }

  public async getTimeRangeCount(
    collection: string,
    start: number,
    end: number,
  ): Promise<any> {
    const url = `${this.api.extended}/analytics/${collection}/count/${start}/${end}/total`;

    const count = await this.to(this.http.get(url));
    if (count.error) {
      throw count.error;
    }

    return count.data;
  }

  public async getTimeRangeCountAggregate(
    collection: string,
    start: number,
    end: number,
    group: string,
  ): Promise<any> {
    const url = `${this.api.extended}/analytics/${collection}/count/${start}/${end}/aggregate?group=${group}`;

    const countSeries = await this.to(this.http.get(url));
    if (countSeries.error) {
      throw countSeries.error;
    }

    return countSeries.data;
  }
}
