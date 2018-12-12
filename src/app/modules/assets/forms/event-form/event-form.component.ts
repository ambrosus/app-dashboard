import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { DomSanitizer } from '@angular/platform-browser';
import { autocomplete } from 'app/constant';
import { MatDialog } from '@angular/material';
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

  @Input() assetIds: string[];

  isObject(value) {
    return typeof value === 'object';
  }

  constructor(
    private storageService: StorageService,
    private assetsService: AssetsService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
  ) { }

  progress() {
    const dialogRef = this.dialog.open(ProgressComponent, {
      panelClass: 'progress',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Progress event form closed', result);
    });
  }

  confirm(question: string, buttons = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        panelClass: 'confirm',
        data: {
          question,
          buttons,
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        resolve(result);
      });
    });
  }

  async close() {
    const confirm = await this.confirm('Are you sure you want to close?', { cancel: 'No', ok: 'Yes' });
    console.log('Confirm ->', confirm);
    if (confirm) {
      this.dialog.closeAll();
    }
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  ngOnInit() {
    const account: any = this.storageService.get('account') || {};
    this.hasPermission = account.permissions && Array.isArray(account.permissions) && account.permissions.indexOf('create_event') > -1;

    this.initForm();
  }

  private initForm() {
    this.forms.event = new FormGroup({
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
        GLN: new FormControl(null, []),
      }),
    });
  }

  // Methods for adding/removing new fields to the form

  remove(array, index: number) {
    (<FormArray>this.forms.event.get(array)).removeAt(index);
  }

  addDocument(event, input) {
    if (event.keyCode === 13) {
      const value = event.target.value;
      const form = this.forms.event.value;
      let name = value.split('/');
      name = name[name.length - 1];
      if (value) {
        (<FormArray>this.forms.event.get('documents')).push(
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
    (<FormArray>this.forms.event.get('identifiers')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  addProperty() {
    (<FormArray>this.forms.event.get('properties')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
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

  create() {
    this.promise['create'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.event;

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
