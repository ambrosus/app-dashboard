/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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

  public async getTimeRangeCountForOrganization(
    organizationId: number,
    collection: string,
    start: number,
    end: number,
  ): Promise<any> {
    const url = `${this.api.extended}/analytics/${organizationId}/${collection}/count/${start}/${end}/total`;

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

  public async getTimeRangeCountAggregateForOrganization(
    organizationId: number,
    collection: string,
    start: number,
    end: number,
    group: string,
  ): Promise<any> {
    const url = `${this.api.extended}/analytics/${organizationId}/${collection}/count/${start}/${end}/aggregate/${group}`;

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
