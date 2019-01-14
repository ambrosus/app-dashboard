import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
import { environment } from 'environments/environment.prod';
import * as moment from 'moment-timezone';
import { MessageService } from 'app/services/message.service';
declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  inputChanged = new Subject();
  private _events: BehaviorSubject<any> = new BehaviorSubject({
    meta: {},
    data: [],
    pagination: {},
  });
  private _assets: BehaviorSubject<any> = new BehaviorSubject({
    meta: {},
    data: [],
    pagination: {},
  });
  public asset: BehaviorSubject<any> = new BehaviorSubject({});
  public event: BehaviorSubject<any> = new BehaviorSubject({});
  private _assetsSearch: BehaviorSubject<any> = new BehaviorSubject({
    meta: {},
    data: [],
    pagination: {},
  });
  searchQuery: {
    from?: number,
    to?: number,
    name?: string,
    state?: any[],
    identifiers?: any[],
    location?: any,
    address?: string,
  } = {};
  ambrosus;
  api;
  responses: any[] = [];
  progress: any = {
    title: '',
    creating: 0,
    for: 'assets',
    status: {
      start: new Subject(),
      asset: new Subject(),
      event: new Subject(),
      done: new Subject(),
      inProgress: false,
    },
  };
  initiatedNoAssets = false;

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private messageService: MessageService,
  ) {
    this.initSDK();
    this.api = environment.api;

    const account: any = this.storageService.get('account') || {};
    if (account.address) {
      this.getAssets().then();
    } else {
      this.initiatedNoAssets = true;
    }

    this.progress.status.start.subscribe(next => {
      this.progress.status.inProgress = true;
    });

    this.progress.status.done.subscribe(next => {
      this.progress.status.inProgress = false;
    });
  }

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => response)
      .catch(error => ({ error }));
  }

  get assets(): any {
    return this._assets.asObservable();
  }

  get assetsSearch(): any {
    return this._assetsSearch.asObservable();
  }

  get events(): any {
    return this._events.asObservable();
  }

  set events(options) {
    if (options && options.data) {
      options = JSON.parse(JSON.stringify(options));
      options.data = this.ambrosus.utils.parseTimelineEvents(options.data);
      const events = this._events.getValue();
      if (options.change === 'data' && Array.isArray(options.data)) {
        switch (options.type) {
          case 'all':
            events['data'] = options.data;
            break;
          case 'start':
            options.data.map(event => events.data.unshift(event));
            break;
          case 'end':
            events.data = events.data.concat(options.data);
            break;
        }
        this._events.next(events);
      } else if (options.change === 'reset') {
        delete options.change;
        this._events.next(options);
      } else {
        const data = events.data.concat(options.data);
        options.data = data;
        this._events.next(options);
      }
    }
  }

  set assets(options) {
    if (options) {
      options = JSON.parse(JSON.stringify(options));
      const assets = this._assets.getValue();

      if (options.clean) {
        console.log('clean');
        this._assets.next({
          meta: {},
          data: [],
          pagination: {},
        });
      } else if (options.change === 'data' && Array.isArray(options.data)) {
        switch (options.type) {
          case 'all':
            assets['data'] = options.data;
            break;
          case 'start':
            options.data.map(asset => assets.data.unshift(asset));
            break;
          case 'end':
            assets.data = assets.data.concat(options.data);
            break;
        }
        this._assets.next(assets);
      } else {
        options.data = assets.data.concat(options.data);
        this._assets.next(options);
      }
    }
  }

  set assetsSearch(options) {
    if (options) {
      options = JSON.parse(JSON.stringify(options));
      const assets = this._assetsSearch.getValue();

      if (options.clean) {
        console.log('clean');
        this._assetsSearch.next({
          meta: {},
          data: [],
          pagination: {},
        });
      } else if (options.change === 'data' && Array.isArray(options.data)) {
        switch (options.type) {
          case 'all':
            assets['data'] = options.data;
            break;
          case 'start':
            options.data.map(asset => assets.data.unshift(asset));
            break;
          case 'end':
            assets.data = assets.data.concat(options.data);
            break;
        }
        this._assetsSearch.next(assets);
      } else {
        options.data = assets.data.concat(options.data);
        this._assetsSearch.next(options);
      }
    }
  }

  initSDK() {
    const secret = this.storageService.get('secret');
    const token = this.storageService.get('token');

    this.ambrosus = new AmbrosusSDK({
      secret,
      Web3,
      headers: {
        Authorization: `AMB_TOKEN ${token}`,
      },
    });
  }

  async searchAssets(options: {
    limit?: number;
    next?: string;
  } = {}): Promise<any> {
    let { limit, next } = options;
    const { name, state, identifiers, location, address } = this.searchQuery;
    let { from, to } = this.searchQuery;
    limit = limit || 15;
    next = next || '';

    // 1. Get events based on search query

    let url = `${this.api.extended}/event/query`;
    let body: any = {
      query: [
        {
          field: 'content.idData.createdBy',
          value: address,
          operator: 'equal',
        },
      ],
      limit,
      next,
    };

    if (to) {
      to = moment(to * 1000).tz('UTC').unix();
    }

    if (from) {
      from = moment(from * 1000).tz('UTC').unix();

      if (moment().tz('UTC').format('DD.MM.YYYY') === moment(from * 1000).format('DD.MM.YYYY')) {
        from = moment().startOf('day').tz('UTC').unix();
      }
    }

    if (from && to) {
      body.query.push({
        field: 'content.idData.timestamp',
        value: { 'greater-than-equal': from, 'less-than-equal': to },
        operator: 'inrange',
      });
    }
    if (from && !to) {
      body.query.push({
        field: 'content.idData.timestamp',
        value: from,
        operator: 'greater-than-equal',
      });
    }
    if (to && !from) {
      body.query.push({
        field: 'content.idData.timestamp',
        value: to,
        operator: 'less-than-equal',
      });
    }
    if (name) {
      body.query.push({
        field: 'content.data.name',
        value: name,
        operator: 'contains',
      });
    }
    if (Array.isArray(state) && state.length) {
      body.query.push({
        field: 'content.data.type',
        value: state,
        operator: 'equal',
      });
    }
    if (Array.isArray(identifiers) && identifiers.length) {
      identifiers.map(identifier => {
        if (identifier.name && identifier.value) {
          body.query.push({
            field: `content.data.identifiers.${identifier.name}`,
            value: identifier.value,
            operator: 'equal',
          });
        }
      });
    }
    if (location) {
      const { city, country, GLN, locationId } = location;
      if (city) {
        body.query.push({
          field: 'content.data.city',
          value: city,
          operator: 'contains',
        });
      }
      if (country) {
        body.query.push({
          field: 'content.data.country',
          value: country,
          operator: 'contains',
        });
      }
      if (GLN) {
        body.query.push({
          field: 'content.data.GLN',
          value: GLN,
          operator: 'contains',
        });
      }
      if (locationId) {
        body.query.push({
          field: 'content.data.locationId',
          value: locationId,
          operator: 'contains',
        });
      }
    }

    console.log(JSON.stringify(body, null, 2));

    const events = await this.to(this.http.post(url, body));
    if (events.error) {
      this.messageService.error(events.error);
      Promise.reject(events.error);
      return;
    }
    console.log('[GET] Events (search): ', events.data);

    // 2. Create fake assets

    const assets = events.data.reduce((_assets, event, index, array) => {
      if (!_assets.data.some(asset => asset.assetId === event.content.idData.assetId)) {
        _assets.data.push({
          assetId: event.content.idData.assetId,
          content: {
            idData: {
              createdBy: event.content.idData.createdBy,
            },
          },
        });
      }

      return _assets;
    }, {
        data: [],
        pagination: events.pagination,
      });

    const ids = assets.data.reduce((_ids, asset, index, array) => {
      if (_ids.indexOf(asset.assetId) === -1) {
        _ids.push(asset.assetId);
      }
      return _ids;
    }, []);

    // 3. Get latest info events for final assets

    url = `${this.api.extended}/event/latest/type`;
    body = {
      type: 'ambrosus.asset.info',
      assets: ids,
    };

    const infoEvents = await this.to(this.http.post(url, body));
    if (infoEvents.error) {
      this.messageService.error(infoEvents.error);
      Promise.reject(infoEvents.error);
      return;
    }
    console.log('[GET] Info events: ', infoEvents.data);

    // Connect assets with info events
    assets.data = assets.data.map(asset => {
      asset.info = infoEvents.data.find(
        event => asset.assetId === event.content.idData.assetId,
      );

      if (asset.info) {
        asset.info = this.ambrosus.utils.findEvent('info', [asset.info]);
      }

      return asset;
    });

    this.assetsSearch = assets;

    Promise.resolve();
  }

  async getAssets(options: {
    limit?: number;
    next?: string;
  } = {}): Promise<any> {
    let { limit, next } = options;
    const account = <any>this.storageService.get('account') || {};
    const { address } = account;
    limit = limit || 15;
    next = next || '';

    let url = `${this.api.extended}/asset/query`;
    let body: any = {
      query: [
        {
          field: 'content.idData.createdBy',
          value: address,
          operator: 'equal',
        },
      ],
      limit,
      next,
    };

    const assets = await this.to(this.http.post(url, body));
    if (assets.error) {
      this.messageService.error(assets.error);
      return;
    }
    console.log('[GET] Assets: ', assets.data);

    const ids = assets.data.reduce((_ids, asset, index, array) => {
      _ids.push(asset.assetId);
      return _ids;
    }, []);

    // Get latest info events
    url = `${this.api.extended}/event/latest/type`;
    body = {
      type: 'ambrosus.asset.info',
      assets: ids,
    };

    const infoEvents = await this.to(this.http.post(url, body));
    if (infoEvents.error) {
      this.messageService.error(infoEvents.error);
      return;
    }
    console.log('[GET] Info events: ', infoEvents.data);

    // Connect assets with info events
    assets.data = assets.data.map(asset => {
      asset.info = infoEvents.data.find(
        event => asset.assetId === event.content.idData.assetId,
      );

      if (asset.info) {
        asset.info = this.ambrosus.utils.findEvent('info', [asset.info]);
      }

      return asset;
    });

    this.assets = assets;
  }

  getAsset(assetId: string): Observable<any> {
    let url = `${this.api.extended}/asset/query`;
    let body: any = {
      query: [
        {
          field: 'assetId',
          value: assetId,
          operator: 'equal',
        },
      ],
    };

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        (assets: any) => {
          if (!assets.data || !Array.isArray(assets.data) || !assets.data.length) {
            return observer.error('No asset');
          }

          // Get latest info events
          url = `${this.api.extended}/event/latest/type`;
          body = {
            type: 'ambrosus.asset.info',
            assets: [assetId],
          };

          this.http.post(url, body).subscribe(
            (infoEvents: any) => {
              assets.data[0]['info'] = this.ambrosus.utils.findEvent(
                'info',
                infoEvents.data,
              );
              this.ambrosus.utils.parseAsset(assets.data[0]);

              this.asset.next(assets.data[0]);

              observer.next(assets.data[0]);
              observer.complete();
            },
            error => {
              this.messageService.error(error);
              observer.error(error);
            },
          );
        },
        error => {
          this.messageService.error(error);
          observer.error(error);
        },
      );
    });
  }

  async getEvents(options: {
    assetId: string;
    limit?: number;
    next?: string;
  }): Promise<void> {
    const { assetId, limit, next } = options;

    const url = `${this.api.extended}/event/query`;
    const body: any = {
      query: [
        {
          field: 'content.idData.assetId',
          value: assetId,
          operator: 'equal',
        },
      ],
      limit,
      next,
    };

    const events = await this.to(this.http.post(url, body));
    if (events.error) {
      this.messageService.error(events.error);
      return;
    }
    console.log('(GET) Events:', events);

    this.events = events;
  }

  async getMaxEvents(options: {
    assetId: string;
    limit?: number;
  }): Promise<any> {
    const { assetId, limit } = options;

    const url = `${this.api.extended}/event/query`;
    const body: any = {
      query: [
        {
          field: 'content.idData.assetId',
          value: assetId,
          operator: 'equal',
        },
      ],
      limit,
    };

    const events = await this.to(this.http.post(url, body));
    if (events.error) {
      this.messageService.error(events.error);
      throw events.error;
    }
    console.log('[GET] Max events: ', events);

    return events;
  }

  getEvent(eventId: string): Observable<any> {
    const url = `${this.api.extended}/event/query`;
    const body: any = {
      query: [
        {
          field: 'eventId',
          value: eventId,
          operator: 'equal',
        },
      ],
    };

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        (events: any) => {
          if (!events.data || !Array.isArray(events.data) || !events.data.length) {
            return observer.error('No event');
          }

          this.event.next(this.ambrosus.utils.parseEvent(events.data[0]));
          observer.next(this.ambrosus.utils.parseEvent(events.data[0]));
          observer.complete();
        },
        error => observer.error('No event'),
      );
    });
  }

  wait() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }

  // Create methods

  async createAsset(asset: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.wait();

        const url = `${this.api.core}/assets`;
        const data = { created: [], errors: [] };

        const assetCreated = await this.to(this.http.post(url, asset));
        if (assetCreated.error) {
          this.progress.status.asset.next({ asset, error: assetCreated.error });
          this.responses[this.responses.length - 1].assets.error.push(assetCreated.error);
          // debug
          console.log('Create asset error: ', assetCreated.error);
          return reject(assetCreated.error);
        }
        this.progress.status.asset.next(assetCreated);
        this.responses[this.responses.length - 1].assets.success.push(assetCreated);

        // debug
        console.log('Create asset success: ', assetCreated);

        data['change'] = 'data';
        data['type'] = 'start';
        data['data'] = [assetCreated];

        this.assets = data;

        resolve(assetCreated);
      } catch (error) {
        reject(error);
      }
    });
  }

  async createEvents(events: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const data: any = { created: [], errors: [] };

      try {
        for (const event of events) {
          await this.wait();

          const url = `${this.api.core}/assets/${event.content.idData.assetId}/events`;

          const eventCreated = await this.to(this.http.post(url, event));

          if (eventCreated.error) {
            data.errors.push({ event, error: eventCreated.error });
            this.responses[this.responses.length - 1].events.error.push(eventCreated.error);
            this.progress.status.event.next();
          } else {
            data.created.push(eventCreated);
            this.progress.status.event.next(eventCreated);
            this.responses[this.responses.length - 1].events.success.push(eventCreated);
          }
        }

        // Update _events
        const eventsData = this._events.getValue().data;
        if (eventsData && eventsData.length) {
          data['change'] = 'data';
          data['type'] = 'start';
          data['data'] = data.created;
          this.events = data;
        }

        // Update event
        const eventData = this.event.getValue();
        try {
          if (data.created.length === 1 && eventData.content.idData.assetId === data.created[0].content.idData.assetId) {
            this.event.next(this.ambrosus.utils.parseEvent(JSON.parse(JSON.stringify(data.created[0]))));
          }
        } catch (error) { }

        // Update _assets
        let assetsData = this._assets.getValue().data;
        assetsData = assetsData.map(asset => {
          const assetEvents = data.created.filter(
            _event => asset.assetId === _event.content.idData.assetId,
          );
          const info = this.ambrosus.utils.findEvent('info', assetEvents);
          if (info) {
            asset['info'] = info;
          }
          return asset;
        });
        const options = { change: 'data', type: 'all', data: assetsData };
        this.assets = options;

        // Update asset
        const assetData = this.asset.getValue();
        try {
          if (data.created.length === 1 && assetData.assetId === data.created[0].content.idData.assetId) {
            const info = this.ambrosus.utils.findEvent('info', JSON.parse(JSON.stringify(data.created)));
            const asset = {
              info,
              content: assetData.content,
              metadata: assetData.metadata,
            };
            this.ambrosus.utils.parseAsset(asset);
            this.asset.next(asset);
          }
        } catch (error) { }

        resolve(options);

        return data;
      } catch (error) {
        reject(error);
        throw error;
      }
    });
  }
}
