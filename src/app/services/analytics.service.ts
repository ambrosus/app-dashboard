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
    const url = `${this.api.extended}/analytics/${collection}/count/${start}/${end}/aggregate/${group}`;

    const countSeries = await this.to(this.http.get(url));
    if (countSeries.error) {
      throw countSeries.error;
    }

    return countSeries.data;
  }

  public async amb(): Promise<any> {
    const url = `${this.api.extended}/metrics/amb`;

    const amb = await this.to(this.http.get(url));
    if (amb.error) {
      throw amb.error;
    }

    return amb;
  }

  public async bundle(): Promise<any> {
    const url = `${this.api.extended}/metrics/bundle`;

    const bundle = await this.to(this.http.get(url));
    if (bundle.error) {
      throw bundle.error;
    }

    return bundle;
  }

  public async balance(): Promise<any> {
    const url = `${this.api.extended}/metrics/balance`;

    const balance = await this.to(this.http.get(url));
    if (balance.error) {
      throw balance.error;
    }

    return balance;
  }
}
