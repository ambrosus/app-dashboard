import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EventFormComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  eventForm: FormGroup;
  error;
  success;
  spinner;
  identifiersAutocomplete = [
    'UPCE',
    'UPC12',
    'EAN8',
    'EAN13',
    'CODE 39',
    'CODE 128',
    'ITF',
    'QR',
    'DATAMATRIX',
    'RFID',
    'NFC',
    'GTIN',
    'GLN',
    'SSCC',
    'GSIN',
    'GINC',
    'GRAI',
    'GIAI',
    'GSRN',
    'GDTI',
    'GCN',
    'CPID',
    'GMN',
  ];

  @Input() assetIds: String[];

  isObject(value) {
    return typeof value === 'object';
  }

  constructor(
    private storageService: StorageService,
    private assetsService: AssetsService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  ngOnInit() {
    this.initForm();

    this.subs[this.subs.length] = this.assetsService.creatingAsset.subscribe(
      response => console.log('[CREATE] Asset: ', response),
      error => console.error('[CREATE] Asset: ', error),
    );

    this.subs[this.subs.length] = this.assetsService.creatingEvent.subscribe(
      response => console.log('[CREATE] Event: ', response),
      error => console.error('[CREATE] Event: ', error),
    );
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  to(P: Promise<any>) {
    return P.then(response => response).catch(error => ({ error }));
  }

  cancel() {
    this.router.navigate([`${location.pathname}`]);
  }

  private initForm() {
    this.eventForm = new FormGroup({
      type: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null, []),
      accessLevel: new FormControl(0, []),
      documents: new FormArray([]),
      identifiers: new FormArray([
        new FormGroup({
          name: new FormControl(null, []),
          value: new FormControl(null, []),
        }),
      ]),
      properties: new FormArray([
        new FormGroup({
          name: new FormControl(null, []),
          value: new FormControl(null, []),
        }),
      ]),
      groups: new FormArray([]),
      location: new FormGroup({
        lat: new FormControl(null, []),
        lng: new FormControl(null, []),
        city: new FormControl(null, []),
        country: new FormControl(null, []),
        locationId: new FormControl(null, []),
        gln: new FormControl(null, []),
      }),
    });
  }

  // Methods for adding/removing new fields to the form

  remove(array, index: number) {
    (<FormArray>this.eventForm.get(array)).removeAt(index);
  }

  addDocument(event, input) {
    if (event.keyCode === 13) {
      const value = event.target.value;
      const form = this.eventForm.value;
      let name = value.split('/');
      name = name[name.length - 1];
      if (value) {
        (<FormArray>this.eventForm.get('documents')).push(
          new FormGroup({
            name: new FormControl(name, []),
            url: new FormControl(event.target.value, []),
          }),
        );
      }
      input.value = '';
    }
  }

  addIdentifier() {
    (<FormArray>this.eventForm.get('identifiers')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  addProperty() {
    (<FormArray>this.eventForm.get('properties')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  addGroup() {
    (<FormArray>this.eventForm.get('groups')).push(
      new FormGroup({
        title: new FormControl(null, []),
        content: new FormArray([
          new FormGroup({
            name: new FormControl(null, []),
            value: new FormControl(null, []),
          }),
        ]),
      }),
    );
  }

  addGroupProperty(i) {
    const groups = <FormArray>this.eventForm.get('groups');
    (<FormArray>groups.at(i).get('content')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  removeGroupProperty(i, j) {
    const groups = <FormArray>this.eventForm.get('groups');
    (<FormArray>groups.at(i).get('content')).removeAt(j);
  }

  private generateEvent(assetId) {
    const address = this.storageService.get('account')['address'];
    const secret = this.storageService.get('secret');
    const eventForm = this.eventForm.getRawValue();

    const data = [];

    // Identifiers object
    const ide = eventForm.identifiers;
    if (ide.length > 0) {
      const identifiers = {};
      identifiers['type'] = 'ambrosus.event.identifiers';
      identifiers['identifiers'] = {};
      ide.map(item => {
        if (item.name && item.value) {
          identifiers['identifiers'][item.name] = [];
          identifiers['identifiers'][item.name].push(item.value);
        }
      });

      if (Object.keys(identifiers['identifiers']).length) {
        data.push(identifiers);
      }
    }

    // Information
    const info = {};

    info['type'] = eventForm.type;
    info['name'] = eventForm.name;
    const description = eventForm.description;
    if (description) {
      info['description'] = description;
    }

    // Documents
    const documents = eventForm.documents;
    if (documents.length > 0) {
      const _documents = {};
      documents.map((document, index, array) => {
        if (document.name && document.url) {
          _documents[document.name] = {};
          _documents[document.name]['url'] = document.url;
        }
      });

      if (Object.keys(_documents).length) {
        info['documents'] = _documents;
      }
    }

    // Properties
    eventForm.properties.map(item => {
      if (item.name && item.value) {
        info[item.name] = item.value;
      }
    });

    // Groups
    const groups = eventForm.groups;
    groups.map(group => {
      if (group.title && group.content.length) {
        const _group = {};
        group.content.map(property => {
          if (property.name && property.value) {
            _group[property.name] = property.value;
          }
        });
        if (Object.keys(_group).length) {
          info[group.title] = _group;
        }
      }
    });

    data.push(info);

    // Location Event
    const location = eventForm.location;
    const { lat, lng, name, city, country, locationId, gln } = location;

    if (
      (lat || lat === 0) &&
      (lng || lng === 0) &&
      city &&
      country &&
      locationId &&
      gln
    ) {
      const _location = {
        type: 'ambrosus.event.location',
        location: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lat, lng],
          },
        },
        city,
        country,
        locationId,
        gln,
      };

      data.push(_location);
    }

    // Finish signing event

    const idData = {
      assetId,
      timestamp: Math.floor(new Date().getTime() / 1000),
      accessLevel: eventForm.accessLevel,
      createdBy: address,
      dataHash: this.assetsService.calculateHash(data),
    };

    const content = {
      idData,
      signature: this.assetsService.sign(idData, secret),
      data,
    };

    const event = {
      eventId: this.assetsService.calculateHash(content),
      content,
    };

    return event;
  }

  async save() {
    this.error = false;
    this.success = false;
    const form = this.eventForm;

    if (form.invalid) {
      return (this.error = 'Form is invalid');
    }
    if (!this.assetIds.length) {
      return (this.error = 'No assets are selected');
    }

    const data = form.getRawValue();

    // Location Event
    const location = data.location;
    const { lat, lng, city, country, locationId, gln } = location;

    if (
      lat ||
      lat === 0 ||
      (lng || lng === 0) ||
      city ||
      country ||
      locationId ||
      gln
    ) {
      if (
        !(
          (lat || lat === 0) &&
          (lng || lng === 0) &&
          city &&
          country &&
          locationId &&
          gln
        )
      ) {
        return (this.error =
          'Event location must either be blank or completely filled');
      }
    }

    // Confirmation window
    if (
      !confirm(
        `You are about to create an event for ${this.assetIds.length} asset${
        this.assetIds.length === 1 ? '' : 's'
        }, are you sure you want to proceed?`,
      )
    ) {
      return;
    }

    // Make a request
    const events = [];
    this.assetIds.map(assetId => events.push(this.generateEvent(assetId)));

    console.log('Creating events');
    const eventsCreated = await this.to(
      this.assetsService.createEvents(events),
    );
    this.success = 'Success';
  }
}
