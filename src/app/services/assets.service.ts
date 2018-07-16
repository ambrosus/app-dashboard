import { environment } from 'environments/environment';
import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

declare let AmbrosusSDK: any;

@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  assetsSelected: string[] = [];
  toggleSelect: Subject<any> = new Subject();
  inputChanged = new Subject();
  assets: {};
  // SDK
  ambrosus: any = {};
  // Parsing get asset/event
  currentAssetId: string;
  asset;
  eventAdded = new Subject();
  eventAddFailed = new Subject();
  addEventsJSON;
  addAssetAndInfoEventJSON;
  editInfoEventJSON;
  infoEventCreated = new Subject();
  infoEventFailed = new Subject();

  constructor(private http: HttpClient, private storage: StorageService) {
    this.initSDK();
  }

  initSDK() {
    const apiEndpoint = environment.host;

    this.ambrosus = new AmbrosusSDK({
      apiEndpoint: apiEndpoint,
      secret: this.storage.get('secret'),
      address: this.storage.get('address')
    });
  }

  isValidURL(str) {
    const a = document.createElement('a');
    a.href = str;
    return a.host && a.host !== window.location.host;
  }

  sortEventsByTimestamp(a, b) {
    if (a[1].timestamp > b[1].timestamp) {
      return -1;
    }
    if (a[1].timestamp < b[1].timestamp) {
      return 1;
    }
    return 0;
  }

  sortEventsAllTimestamp(a, b) {
    if (a.timestamp > b.timestamp) {
      return -1;
    }
    if (a.timestamp < b.timestamp) {
      return 1;
    }
    return 0;
  }

  // GET asset and GET event

  getAsset(assetId) {
    return new Observable(observer => {
      if (this.currentAssetId && this.currentAssetId === assetId) {
        return observer.next(this.asset);
      }

      this.getAssetDetails(assetId).then(response => {
        this.getEvents(assetId).then(eventsArray => {
          this.parseEvents(eventsArray).then(parsedData => {
            this.asset = parsedData;
            return observer.next(this.handleRedirection(assetId));
          });
        });
      });
    });
  }

  getAssetDetails(assetId) {
    return new Promise((resolve, reject) => {
      this.ambrosus
        .getAssetById(assetId)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  getEvents(assetId) {
    return new Promise((resolve, reject) => {
      this.ambrosus
        .getEvents({ assetId: assetId })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  parseEvents(eventsArray) {
    return new Promise((resolve, reject) => {
      this.ambrosus
        .parseEvents(eventsArray)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  handleRedirection(assetId) {
    this.asset.events = Object.entries(this.asset.events)
      .sort(this.sortEventsByTimestamp)
      .reduce((array: any, event) => array.concat(event[1]), []);

    if (
      this.asset.redirection &&
      this.isValidURL(this.asset.redirection.targetUrl)
    ) {
      // window.location.replace(this.asset.redirection.targetUrl);
      // return false;
    } else {
      delete this.asset.redirection;
    }

    return this.asset;
  }

  getEventById(eventId) {
    return new Observable(observer => {
      this.asset.events.some(e => {
        if (e.eventId === eventId) {
          observer.next(e);
          return true;
        }
      });
    });
  }

  // All unfiltered events
  getEventsAll(assetId) {
    return new Observable(observer => {
      this.getEvents(assetId)
        .then((resp: any) => {
          const events = resp.results.reduce(
            (_events, { content, eventId }) => {
              const timestamp = content.idData.timestamp;
              const author = content.idData.createdBy;

              if (content && content.data) {
                content.data.filter(obj => {
                  obj.timestamp = timestamp;
                  obj.author = author;
                  obj.name = obj.name || obj.type;
                  obj.action = obj.type;
                  obj.type = obj.type.substr(obj.type.lastIndexOf('.') + 1);
                  obj.eventId = eventId;

                  if (obj.type === 'location') {
                    content.data.reduce((location, _event) => {
                      if (_event.type !== 'location') {
                        _event.location = location;
                      }
                    }, obj);
                  }

                  _events.push(obj);
                  return obj;
                });
              }
              return _events;
            },
            []
          );

          events.sort(this.sortEventsAllTimestamp);

          return observer.next(events);
        })
        .catch(err => {
          return observer.error(err);
        });
    });
  }

  SDKgetEventById(eventId) {
    return new Observable(observer => {
      this.ambrosus
        .getEventById(eventId)
        .then(resp => {
          return observer.next(resp.data);
        })
        .catch(err => {
          return observer.error(err);
        });
    });
  }

  searchEvents(queries, page = 0, perPage = 20, address) {
    const params = {};
    queries.map((query) => {
      params[query.param] = query.value;
    });
    params['page'] = page;
    params['perPage'] = perPage;
    return new Promise((resolve, reject) => {
      this.ambrosus.getEvents(params).then(resp => {
        // Unique events
        const events = this.latestEvents(resp.data.results);
        // Extract and build asset objects in []
        const assets = events.reduce((_assets, event) => {
          const asset = {
            assetId: event.content.idData.assetId,
            content: {
              idData: {
                createdBy: event.content.idData.createdBy,
                timestamp: event.content.idData.timestamp
              }
            }
          };
          _assets.push(asset);
          return _assets;
        }, []);
        // Get info events + connect them to assets
        const that = this;
        const _params = {
          createdBy: address,
          'data[type]': 'ambrosus.asset.info'
        };
        this.ambrosus.getEvents(_params).then(function(info) {
          const _assets = {
            resultCount: resp.data.resultCount,
            assets: that.parseAssetsInfo(assets, info.data.results)
          };
          resolve(_assets);
        }).catch(function(e) {
          console.log('Get info events error: ', e);
          reject(e);
        });
      }).catch(error => {
        reject('No event results.');
      });
    });
  }

  // GET assets

  getAssetsInfo(page = 0, perPage = 20, address = this.storage.get('address')) {
    let cachedAssetsInfo;
    try {
      cachedAssetsInfo = JSON.parse(this.storage.get('assets')) || null;
    } catch (e) {
      cachedAssetsInfo = null;
    }
    const that = this;
    const params = {
      createdBy: address,
      page: page,
      perPage: perPage
    };

    return new Observable(observer => {
      if (cachedAssetsInfo) {
        observer.next(cachedAssetsInfo);
      }

      // 1. Get all the assets
      this.ambrosus
        .getAssets(params)
        .then(function(assets) {
          // 2. Get all info events
          const _params = {
            createdBy: address,
            'data[type]': 'ambrosus.asset.info'
          };
          that.ambrosus.getEvents(_params).then(function(info) {
            const _assets = {
              resultCount: assets.data.resultCount,
              assets: that.parseAssetsInfo(assets.data.results, info.data.results)
            };
            that.storage.set('assets', _assets);
            return observer.next(_assets);
          }).catch(function(e) {
            console.log('Get info events error: ', e);
            return observer.error(e);
          });
        })
        .catch(function(error) {
          console.log('Get assets error: ', error);
          return observer.error(error);
        });
    });
  }

  parseAssetsInfo(assets, info) {
    // Latest info event
    info = this.latestEvents(info);
    assets.map((asset) => {
      const _info = info.find((obj) => obj.content.idData.assetId === asset.assetId);
      if (_info) {
        asset.info = _info;
      }
    });
    return assets;
  }

  latestEvents(info) {
    const latestEvents = info.reduce((events, obj) => {
      const exists = events.findIndex((_obj) => obj.content.idData.assetId === _obj.content.idData.assetId);
      if (exists !== -1) {
        if (obj.content.idData.timestamp > events[exists].content.idData.timestamp) {
          events.splice(exists, 1);
          events.push(obj);
        }
      } else {
        events.push(obj);
      }

      return events;
    }, []);

    return latestEvents;
  }

  // CREATE asset and events

  createAsset(data) {
    return new Observable(observer => {
      console.log('CREATE ASSET AMB: ', this.ambrosus);
      this.ambrosus
        .createAsset(data)
        .then(function(resp) {
          return observer.next(resp);
        })
        .catch(function(error) {
          return observer.error(error);
        });
    });
  }

  createEvent(assetId, event) {
    return new Promise((resolve, reject) => {
      console.log('CREATE EVENT AMB: ', this);
      this.ambrosus
        .createEvent(assetId, event)
        .then(function(resp) {
          resolve(resp);
        })
        .catch(function(error) {
          reject(error);
        });
    });
  }

  // Events add
  addEvents() {
    const selectedAssets = this.getSelectedAssets();
    selectedAssets.map((assetId) => {
      this.addEventsJSON.content.idData.assetId = assetId;
      this.addEventsJSON.content.idData.createdBy = this.storage.get('address');
      this.createEvent(assetId, this.addEventsJSON).then(resp => {
        this.eventAdded.next(resp);
      }).catch(err => {
        console.log('Event add failed for asset: ', assetId);
        this.eventAddFailed.next(err);
      });
    });
    this.addEventsJSON = {};
  }

  // For asset creation
  addAssetAndInfoEvent() {
    this.createAsset([]).subscribe(
      (resp: any) => {
        console.log('Asset creation successful ', resp);
        const assetId = resp.data.assetId;
        this.addAssetAndInfoEventJSON.content.idData.assetId = assetId;
        this.addAssetAndInfoEventJSON.content.idData.createdBy = this.storage.get('address');
        this.createEvent(assetId, this.addAssetAndInfoEventJSON).then(response => {
          console.log('Assets event creation successful ', response);
          this.infoEventCreated.next(response);
        }).catch(error => {
          console.log('Assets event creation failed ', error);
          this.infoEventFailed.next(error);
        });
      },
      err => {
        console.log('Asset creation failed ', err);
        this.infoEventFailed.next(err);
      }
    );
  }

  // Only info event editing
  editInfoEvent() {
    const assetId = this.getSelectedAssets()[0];
    this.editInfoEventJSON.content.idData.assetId = assetId;
    this.editInfoEventJSON.content.idData.createdBy = this.storage.get('address');
    this.createEvent(assetId, this.editInfoEventJSON).then(resp => {
      console.log('Info event creation/edit successful ', resp);
      this.infoEventCreated.next(resp);
    }).catch(err => {
      console.log('Info event creation/edit failed ', err);
      this.infoEventFailed.next(err);
    });
  }

  // assetId selection service
  selectAsset(assetId: string) {
    this.assetsSelected.push(assetId);
  }

  unselectAsset(assetId: string) {
    const index = this.assetsSelected.indexOf(assetId);
    if (index > -1) {
      this.assetsSelected.splice(index, 1);
    }
  }

  unselectAssets() {
    this.assetsSelected = [];
  }

  getSelectedAssets() {
    // return [...new Set(this.assets)];
    return Array.from(new Set(this.assetsSelected));
  }
}
