import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent implements OnInit, OnDestroy {
  inputChangedSub: Subscription;
  createEventsSub: Subscription;
  eventForm: FormGroup;
  error;
  success;
  spinner;
  identifiersAutocomplete = ['UPCE', 'UPC12', 'EAN8', 'EAN13', 'CODE 39', 'CODE 128', 'ITF', 'QR', 'DATAMATRIX', 'RFID', 'NFC',
    'GTIN', 'GLN', 'SSCC', 'GSIN', 'GINC', 'GRAI', 'GIAI', 'GSRN', 'GDTI', 'GCN', 'CPID', 'GMN'];

  @Input() prefill;
  @Input() assetIds: String[];

  isObject(value) { return typeof value === 'object'; }

  constructor(private storage: StorageService, private assetsService: AssetsService) {
    this.initForm();
  }

  emit(type) { window.dispatchEvent(new Event(type)); }

  ngOnInit() {
    this.assetsService.inputChanged.subscribe((resp: any) => resp.control.get('identifier').setValue(resp.value));
    this.initForm();
    if (this.prefill) { this.prefillForm(); }
  }

  ngOnDestroy() {
    if (this.inputChangedSub) { this.inputChangedSub.unsubscribe(); }
    if (this.createEventsSub) { this.createEventsSub.unsubscribe(); }
  }

  private initForm() {
    this.eventForm = new FormGroup({
      type: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      accessLevel: new FormControl(0, [Validators.required]),
      documents: new FormArray([]),
      identifiers: new FormArray([]),
      customData: new FormArray([]),
      customDataGroups: new FormArray([]),
      locationEvent: new FormGroup({
        location: new FormGroup({
          geometry: new FormGroup({
            coordinates: new FormArray([
              new FormGroup({
                lat: new FormControl(null, []),
                lng: new FormControl(null, []),
              }),
            ]),
          }),
        }),
        name: new FormControl(null, []),
        city: new FormControl(null, []),
        country: new FormControl(null, []),
        locationId: new FormControl(null, []),
        GLN: new FormControl(null, []),
      }),
      locationAsset: new FormGroup({
        location: new FormGroup({
          geometry: new FormGroup({
            coordinates: new FormArray([
              new FormGroup({
                lat: new FormControl(null, []),
                lng: new FormControl(null, []),
              }),
            ]),
          }),
        }),
        name: new FormControl(null, []),
        city: new FormControl(null, []),
        country: new FormControl(null, []),
        locationId: new FormControl(null, []),
        GLN: new FormControl(null, []),
      }),
    });
  }

  prefillForm() {
    const event = this.prefill;
    try {
      this.eventForm.get('accessLevel').setValue(event.content.idData.accessLevel);
    } catch (err) { }
    event.content.data.map(obj => {
      switch (obj.type) {
        case 'ambrosus.event.location':
          // Location Event
          const locationEvent = this.eventForm.get('locationEvent');
          locationEvent
            .get('location')
            .get('geometry')
            .get('coordinates')
          ['controls'][0].get('lat')
            .setValue(obj.location.geometry.coordinates[0]);
          locationEvent
            .get('location')
            .get('geometry')
            .get('coordinates')
          ['controls'][0].get('lng')
            .setValue(obj.location.geometry.coordinates[1]);
          Object.keys(obj).map(key => {
            const exists = locationEvent.get(key);
            if (exists && key !== 'location') {
              exists.setValue(obj[key]);
            }
          });
          break;
        case 'ambrosus.asset.location':
          // Location Asset
          const locationAsset = this.eventForm.get('locationAsset');
          locationAsset
            .get('location')
            .get('geometry')
            .get('coordinates')
          ['controls'][0].get('lat')
            .setValue(obj.location.geometry.coordinates[0]);
          locationAsset
            .get('location')
            .get('geometry')
            .get('coordinates')
          ['controls'][0].get('lng')
            .setValue(obj.location.geometry.coordinates[1]);
          Object.keys(obj).map(key => {
            const exists = locationAsset.get(key);
            if (exists && key !== 'location') {
              exists.setValue(obj[key]);
            }
          });
          break;
        case 'ambrosus.event.identifiers':
          // Identifiers
          Object.keys(obj['identifiers']).map(key => {
            if (key !== 'type') {
              (<FormArray>this.eventForm.get('identifiers')).push(
                new FormGroup({
                  identifier: new FormControl(key, [Validators.required]),
                  identifierValue: new FormControl(obj['identifiers'][key][0], [Validators.required]),
                })
              );
            }
          });
          break;
        case 'ambrosus.asset.identifiers':
          break;
        default:
          this.eventForm.get('type').setValue(obj.type);
          this.eventForm.get('name').setValue(obj.name);
          this.eventForm.get('description').setValue(obj.description || '');
          let i = 0;

          Object.keys(obj).map(key => {
            switch (this.isObject(obj[key])) {
              case true:
                if (key === 'documents') {
                  Object.keys(obj[key]).map(doc => {
                    (<FormArray>this.eventForm.get('documents')).push(
                      new FormGroup({
                        documentTitle: new FormControl(doc, [Validators.required]),
                        documentUrl: new FormControl(this.isObject(obj[key][doc]) ?
                          obj[key][doc]['url'] || '' : obj[key][doc] || '', [Validators.required]),
                      })
                    );
                  });
                } else {
                  // Group (custom)
                  // Add a group
                  const customDataGroups = this.eventForm.get('customDataGroups') as FormArray;
                  (<FormArray>customDataGroups).push(
                    new FormGroup({
                      groupName: new FormControl(key, [Validators.required]),
                      groupValue: new FormArray([]),
                    })
                  );
                  // Add key-value to the group
                  Object.keys(obj[key]).map(_key => {
                    (<FormArray>customDataGroups.at(i).get('groupValue')).push(
                      new FormGroup({
                        groupItemKey: new FormControl(_key, [Validators.required]),
                        groupItemValue: new FormControl(this.isObject(obj[key][_key]) ?
                          JSON.stringify(obj[key][_key]).replace(/["{}]/g, '') : obj[key][_key], [Validators.required]),
                      })
                    );
                  });
                  i++;
                }
                break;

              default:
                if (key !== 'type' && key !== 'name' && key !== 'description' && key !== 'accessLevel') {
                  (<FormArray>this.eventForm.get('customData')).push(
                    new FormGroup({
                      customDataKey: new FormControl(key, [Validators.required]),
                      customDataValue: new FormControl(obj[key], [Validators.required]),
                    })
                  );
                }
                break;
            }
          });
          break;
      }
    });
  }

  // Methods for adding new fields to the form

  remove(array, index: number) { (<FormArray>this.eventForm.get(array)).removeAt(index); }

  addDocument() {
    (<FormArray>this.eventForm.get('documents')).push(
      new FormGroup({
        documentTitle: new FormControl('', [Validators.required]),
        documentUrl: new FormControl('', [Validators.required]),
      })
    );
  }

  addIdentifier() {
    (<FormArray>this.eventForm.get('identifiers')).push(
      new FormGroup({
        identifier: new FormControl('', [Validators.required]),
        identifierValue: new FormControl('', [Validators.required]),
      })
    );
  }

  addCustomKeyValue() {
    (<FormArray>this.eventForm.get('customData')).push(
      new FormGroup({
        customDataKey: new FormControl('', [Validators.required]),
        customDataValue: new FormControl('', [Validators.required]),
      })
    );
  }

  addCustomGroup() {
    const customDataGroups = this.eventForm.get('customDataGroups') as FormArray;
    (<FormArray>customDataGroups).push(
      new FormGroup({
        groupName: new FormControl('', [Validators.required]),
        groupValue: new FormArray([
          new FormGroup({
            groupItemKey: new FormControl('', [Validators.required]),
            groupItemValue: new FormControl('', [Validators.required]),
          }),
        ]),
      })
    );
  }

  addCustomGroupKeyValue(i) {
    const groupsArray = this.eventForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).push(
      new FormGroup({
        groupItemKey: new FormControl('', [Validators.required]),
        groupItemValue: new FormControl('', [Validators.required]),
      })
    );
  }

  onRemoveCustomGroupKeyValue(i, j) {
    const groupsArray = this.eventForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).removeAt(j);
  }

  private generateEvent(assetId) {
    const address = this.storage.get('user')['address'];
    const secret = this.storage.get('secret');

    const data = [];

    // Event object (main one)
    const eventObject = {};
    // Basic info
    eventObject['type'] = this.eventForm.get('type').value;
    eventObject['name'] = this.eventForm.get('name').value;
    const description = this.eventForm.get('description').value;
    if (description) { eventObject['description'] = description; }

    // Documents
    const documents = this.eventForm.get('documents')['controls'];
    if (documents.length > 0) {
      eventObject['documents'] = {};
      documents.map((document) => {
        eventObject['documents'][document.value.documentTitle] = {};
        eventObject['documents'][document.value.documentTitle]['url'] = document.value.documentUrl;
      });
    }

    // Custom data key-value
    this.eventForm.get('customData')['controls'].map(item => eventObject[item.value.customDataKey] = item.value.customDataValue);

    // Custom data groups
    const customGroups = this.eventForm.get('customDataGroups')['controls'];
    customGroups.map((item) => {
      eventObject[item.value.groupName] = {};
      item.get('groupValue')['controls'].map(group => eventObject[item.value.groupName][group.value.groupItemKey] = group.value.groupItemValue);
    });

    data.push(eventObject);

    // Identifiers
    const ide = this.eventForm.get('identifiers')['controls'];
    if (ide.length > 0) {
      const identifiers = {
        type: 'ambrosus.event.identifiers',
        identifiers: {},
      };
      ide.map(item => {
        identifiers['identifiers'][item.value.identifier] = [];
        identifiers['identifiers'][item.value.identifier].push(item.value.identifierValue);
      });
      data.push(identifiers);
    }

    // Location Event
    const locationEvent = this.eventForm.get('locationEvent');
    let lat = locationEvent.get('location').get('geometry').get('coordinates')['controls'][0].get('lat').value;
    let lng = locationEvent.get('location').get('geometry').get('coordinates')['controls'][0].get('lng').value;
    let name = locationEvent.get('name').value;
    let city = locationEvent.get('city').value;
    let country = locationEvent.get('country').value;
    let locationId = locationEvent.get('locationId').value;
    let GLN = locationEvent.get('GLN').value;

    if ((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN) {
      const location = {
        type: 'ambrosus.event.location',
        location: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lat, lng],
          },
        },
        name,
        city,
        country,
        locationId,
        GLN,
      };
      data.push(location);
    }

    // Location Asset
    const locationAsset = this.eventForm.get('locationAsset');
    lat = locationAsset.get('location').get('geometry').get('coordinates')['controls'][0].get('lat').value;
    lng = locationAsset.get('location').get('geometry').get('coordinates')['controls'][0].get('lng').value;
    name = locationAsset.get('name').value;
    city = locationAsset.get('city').value;
    country = locationAsset.get('country').value;
    locationId = locationAsset.get('locationId').value;
    GLN = locationAsset.get('GLN').value;

    if ((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN) {
      const location = {
        type: 'ambrosus.asset.location',
        location: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lat, lng],
          },
        },
        name,
        city,
        country,
        locationId,
        GLN,
      };
      data.push(location);
    }

    // Finish signing event

    const idData = {
      assetId,
      timestamp: Math.floor(new Date().getTime() / 1000),
      accessLevel: this.eventForm.get('accessLevel').value,
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

  save() {
    this.error = false;
    this.success = false;

    if (this.eventForm.valid && this.assetIds.length > 0) {

      // Location Event
      const locationEvent = this.eventForm.get('locationEvent');
      let lat = locationEvent.get('location').get('geometry').get('coordinates')['controls'][0].get('lat').value;
      let lng = locationEvent.get('location').get('geometry').get('coordinates')['controls'][0].get('lng').value;
      let name = locationEvent.get('name').value;
      let city = locationEvent.get('city').value;
      let country = locationEvent.get('country').value;
      let locationId = locationEvent.get('locationId').value;
      let GLN = locationEvent.get('GLN').value;
      if ((lat || lat === 0) || (lng || lng === 0) || name || city || country || locationId || GLN) {
        if (!((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN)) {
          return this.error = 'Event location must either be blank or completely filled';
        }
      }

      // Location Asset
      const locationAsset = this.eventForm.get('locationAsset');
      lat = locationAsset.get('location').get('geometry').get('coordinates')['controls'][0].get('lat').value;
      lng = locationAsset.get('location').get('geometry').get('coordinates')['controls'][0].get('lng').value;
      name = locationAsset.get('name').value;
      city = locationAsset.get('city').value;
      country = locationAsset.get('country').value;
      locationId = locationAsset.get('locationId').value;
      GLN = locationAsset.get('GLN').value;
      if ((lat || lat === 0) || (lng || lng === 0) || name || city || country || locationId || GLN) {
        if (!((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN)) {
          return this.error = 'Asset location must either be blank or completely filled';
        }
      }

      // Confirmation window
      if (!confirm(`You are about to create an event for ${this.assetIds.length} ${this.assetIds.length === 1 ? 'asset' : 'assets'}, are you sure you want to proceed?`)) { return; }

      this.spinner = true;

      // Make a request
      const events = [];
      this.assetIds.map(assetId => events.push(this.generateEvent(assetId)));
      this.createEventsSub = this.assetsService.createEvents(events).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.success = 'Success';
          this.emit('event:created');
        },
        err => {
          this.error = err;
          this.spinner = false;
          console.error('Events create error: ', err);
        }
      );

    } else if (!this.eventForm.valid) {
      this.error = 'Please fill all required fields';
    } else if (this.assetIds.length === 0) {
      this.error = 'There are no assets selected';
    }
  }
}
