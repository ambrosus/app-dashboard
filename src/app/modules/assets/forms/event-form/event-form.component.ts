import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { DomSanitizer } from '@angular/platform-browser';
import { autocomplete } from 'app/constant';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmComponent } from 'app/shared/components/confirm/confirm.component';
import { ProgressComponent } from 'app/shared/components/progress/progress.component';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EventFormComponent implements OnInit {
  forms: {
    event?: FormGroup,
  } = {};
  autocomplete: any[] = autocomplete;
  promise: any = {};
  hasPermission = true;
  dialogs: {
    progress?: MatDialogRef<any>,
    confirm?: MatDialogRef<any>,
  } = {};

  @Input() assetIds: string[];
  @Input() prefill: any;

  isObject(value) {
    return typeof value === 'object';
  }

  constructor(
    private storageService: StorageService,
    public assetsService: AssetsService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    const account: any = this.storageService.get('account') || {};
    this.hasPermission = account.permissions && Array.isArray(account.permissions) && account.permissions.indexOf('create_event') > -1;

    this.assetIds = this.assetIds || this.data.assetIds;
    this.prefill = this.prefill || this.data.prefill;

    this.initForm();
    if (this.prefill) {
      this.prefillForm();
    }
  }

  private prefillForm() {
    const form = this.forms.event;
    const event = this.prefill || {};
    const info = this.prefill.info || {};
    let type = '';

    try {
      this.prefill.content.data.map(obj => {
        obj.type = obj.type.split('.');
        obj.type = obj.type[obj.type.length - 1];
        obj.type = obj.type.toLowerCase();

        if (['location', 'identifiers'].indexOf(obj.type) === -1) {
          type = obj.type;
        }
      });
    } catch (error) { }

    form.get('type').setValue(`ambrosus.${type === 'info' ? 'asset' : 'event'}.${type}`);
    form.get('name').setValue(info.name);
    form.get('description').setValue(info.description);
    if (info.images) {
      Object.keys(info.images).map(key => {
        this.addImage({ value: info.images[key].url });
      });
    }
    if (info.documents) {
      Object.keys(info.documents).map(key => {
        this.addDocument({ value: info.documents[key].url });
      });
    }
    if (info.identifiers) {
      this.remove('identifiers', 0);
      Object.keys(info.identifiers.identifiers).map(key => {
        this.addIdentifier(key, info.identifiers.identifiers[key][0]);
      });
    }
    if (Array.isArray(info.properties) && info.properties.length) {
      this.remove('properties', 0);
      info.properties.map(property => {
        this.addProperty(property.key, property.value);
      });
    }
    if (Array.isArray(info.groups) && info.groups.length) {
      info.groups.map(group => {
        const groupProperties = [];

        Object.keys(group.value).map(key => {
          groupProperties.push(
            new FormGroup({
              name: new FormControl(key, []),
              value: new FormControl(group.value[key], []),
            }),
          );
        });

        (<FormArray>this.forms.event.get('groups')).push(
          new FormGroup({
            title: new FormControl(group.key, []),
            content: new FormArray(groupProperties),
          }),
        );
      });
    }

    try {
      if (info.location) {
        const formLocation = form.get('location');
        const lat = info.location.geoJson ? info.location.geoJson.coordinates[0] : info.location.location.geometry.coordinates[0];
        const lng = info.location.geoJson ? info.location.geoJson.coordinates[0] : info.location.location.geometry.coordinates[0];

        formLocation.get('lat').setValue(lat);
        formLocation.get('lng').setValue(lng);
        formLocation.get('city').setValue(info.location.city);
        formLocation.get('country').setValue(info.location.country);
        formLocation.get('locationId').setValue(info.location.locationId);
        formLocation.get('GLN').setValue(info.location.GLN);
      }
      form.get('accessLevel').setValue(event.content.idData.accessLevel || 0);
    } catch (error) {
      console.error('Event prefill: ', error);
    }
  }

  progress() {
    this.dialog.closeAll();

    this.dialogs.progress = this.dialog.open(ProgressComponent, {
      panelClass: 'progress',
      hasBackdrop: false,
    });

    this.dialogs.progress.afterClosed().subscribe(result => {
      console.log('Progress event form closed', result);
    });
  }

  confirm(question: string, buttons = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dialogs.confirm = this.dialog.open(ConfirmComponent, {
        panelClass: 'confirm',
        data: {
          question,
          buttons,
        },
      });

      this.dialogs.confirm.afterClosed().subscribe(result => {
        resolve(result);
      });
    });
  }

  sanitizeUrlDocument(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  sanitizeUrlImage(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  private initForm() {
    this.forms.event = new FormGroup({
      type: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null, []),
      accessLevel: new FormControl(0, []),
      documents: new FormArray([]),
      images: new FormArray([]),
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
        GLN: new FormControl(null, []),
      }),
    });
  }

  // Methods for adding/removing new fields to the form

  remove(array, index: number) {
    (<FormArray>this.forms.event.get(array)).removeAt(index);
  }

  addDocument(input) {
    const value = input.value;
    let name = value.split('/');
    name = name[name.length - 1];
    if (value) {
      (<FormArray>this.forms.event.get('documents')).push(
        new FormGroup({
          name: new FormControl(name, []),
          url: new FormControl(value, []),
        }),
      );
    }
    input.value = '';
  }

  addImage(input) {
    const value = input.value;
    const form = this.forms.event.value;
    let name = value.split('/');
    name = form.images.length ? name[name.length - 1] : 'default';
    if (name !== 'default') {
      name = name.split('.');
      name = name[0];
    }
    if (value) {
      (<FormArray>this.forms.event.get('images')).push(
        new FormGroup({
          name: new FormControl(name, []),
          url: new FormControl(value, []),
        }),
      );
    }
    input.value = '';
  }

  addIdentifier(name = null, value = null) {
    (<FormArray>this.forms.event.get('identifiers')).push(
      new FormGroup({
        name: new FormControl(name, []),
        value: new FormControl(value, []),
      }),
    );
  }

  addProperty(name = null, value = null) {
    (<FormArray>this.forms.event.get('properties')).push(
      new FormGroup({
        name: new FormControl(name, []),
        value: new FormControl(value, []),
      }),
    );
  }

  addGroup() {
    (<FormArray>this.forms.event.get('groups')).push(
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
    const groups = <FormArray>this.forms.event.get('groups');
    (<FormArray>groups.at(i).get('content')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  removeGroupProperty(i, j) {
    const groups = <FormArray>this.forms.event.get('groups');
    (<FormArray>groups.at(i).get('content')).removeAt(j);
  }

  private generateEvent(assetId) {
    const address = this.storageService.get('account')['address'];
    const secret = this.storageService.get('secret');
    const eventForm = this.forms.event.getRawValue();

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
    const { lat, lng, name, city, country, locationId, GLN } = location;

    if ((lat || lat === 0) && (lng || lng === 0) && city && country && locationId && GLN) {
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
        GLN,
      };

      data.push(_location);
    }

    // Finish signing event

    const idData = {
      assetId,
      timestamp: Math.floor(new Date().getTime() / 1000),
      accessLevel: eventForm.accessLevel,
      createdBy: address,
      dataHash: this.assetsService.ambrosus.calculateHash(data),
    };

    const content = {
      idData,
      signature: this.assetsService.ambrosus.sign(idData, secret),
      data,
    };

    const event = {
      eventId: this.assetsService.ambrosus.calculateHash(content),
      content,
    };

    return event;
  }

  create() {
    this.promise['create'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.event;

        if (this.assetsService.progress.status.inProgress) {
          throw new Error('Please wait until current upload completes');
        }

        if (form.invalid) {
          throw new Error('Form is invalid');
        }
        if (!this.assetIds.length) {
          throw new Error('No assets are selected');
        }

        const data = form.getRawValue();

        // Location Event
        const location = data.location;
        const { lat, lng, city, country, locationId, GLN } = location;

        if (lat || lat === 0 || (lng || lng === 0) || city || country || locationId || GLN) {
          if (!((lat || lat === 0) && (lng || lng === 0) && city && country && locationId && GLN)) {
            throw new Error('Event location must either be blank or completely filled');
          }
        }
        console.log('Asset ids: ', this.assetIds);

        const confirm = await this.confirm(
          `You are about to create an event for ${this.assetIds.length} asset${this.assetIds.length === 1 ? '' : 's'}, are you sure you want to proceed?`);
        console.log('Confirm ->', confirm);
        if (!confirm) {
          return reject();
        }

        const events = [];
        this.assetIds.map(assetId => events.push(this.generateEvent(assetId)));

        this.assetsService.responses.push({
          timestamp: Date.now(),
          assets: {
            success: [],
            error: [],
          },
          events: {
            success: [],
            error: [],
          },
        });

        // Start progress
        this.assetsService.progress.title = `Creating 1 event, on ${this.assetIds.length} asset${this.assetIds.length === 1 ? '' : 's'}`;
        this.assetsService.progress.creating = events.length;
        this.assetsService.progress.for = 'events';
        this.progress();
        this.assetsService.progress.status.start.next();

        const eventsCreated = await this.assetsService.createEvents(events);

        this.assetsService.progress.status.done.next();

        console.log('Event form done: ', this.assetsService.responses);

        resolve();
      } catch (error) {
        this.assetsService.progress.status.done.next();

        console.error('[CREATE] Events: ', error);
        reject();
      }
    });
  }
}
