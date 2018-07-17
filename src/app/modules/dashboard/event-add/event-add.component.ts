import { Component, OnInit, ViewEncapsulation, ElementRef, Renderer2, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AssetsService } from 'app/services/assets.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventAddComponent implements OnInit {
  eventForm: FormGroup;
  error = false;
  errorResponse = false;
  success = false;
  spinner = false;
  locationEventError = false;
  locationAssetError = false;
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
    'GMN'
  ];
  json: any;
  buttonText = 'Create event';

  @Input() prefill;
  @Input() assetId;

  isObject(value) {
    return typeof value === 'object';
  }

  constructor(
    private assetService: AssetsService,
    private storage: StorageService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.assetService.inputChanged.subscribe((resp: any) => {
      resp.control.get('identifier').setValue(resp.value);
    });
    this.assetService.eventAdded.subscribe(resp => {
      this.success = true;
      setTimeout(() => {
        this.success = false;
      }, 3000);
      this.spinner = false;
    });
    this.assetService.eventAddFailed.subscribe(resp => {
      this.errorResponse = true;
      this.spinner = false;
    });
    // prefill the form
    if (this.prefill && this.assetId) {
      this.assetService.selectAsset(this.assetId);
      this.prefillForm();
      this.buttonText = 'Edit event';
    }
  }

  prefillForm() {
    const event = this.prefill;
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
          Object.keys(obj).map(key => {
            if (key !== 'type') {
              (<FormArray>this.eventForm.get('identifiers')).push(
                new FormGroup({
                  identifier: new FormControl(key, [Validators.required]),
                  identifierValue: new FormControl(obj[key][0], [Validators.required])
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
                          obj[key][doc]['url'] || '' : obj[key][doc] || '', [Validators.required])
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
                      groupValue: new FormArray([])
                    })
                  );
                  // Add key-value to the group
                  Object.keys(obj[key]).map(_key => {
                    (<FormArray>customDataGroups.at(i).get('groupValue')).push(
                      new FormGroup({
                        groupItemKey: new FormControl(_key, [Validators.required]),
                        groupItemValue: new FormControl(this.isObject(obj[key][_key]) ?
                          JSON.stringify(obj[key][_key]).replace(/["{}]/g, '') : obj[key][_key], [Validators.required])
                      })
                    );
                  });
                  i++;
                }
                break;

              default:
                if (key !== 'type' && key !== 'name' && key !== 'description') {
                  (<FormArray>this.eventForm.get('customData')).push(
                    new FormGroup({
                      customDataKey: new FormControl(key, [Validators.required]),
                      customDataValue: new FormControl(obj[key], [Validators.required])
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

  tabOpen(open, element) {
    this.json = open === 'form' ? false : true;
    const tabHeaderItems = this.el.nativeElement.querySelectorAll('.tab_header_item');
    for (const item of tabHeaderItems) {
      this.renderer.removeClass(item, 'active');
    }
    this.renderer.addClass(element, 'active');
  }

  private initForm() {
    this.eventForm = new FormGroup({
      type: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
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
                lng: new FormControl(null, [])
              })
            ])
          })
        }),
        name: new FormControl(null, []),
        city: new FormControl(null, []),
        country: new FormControl(null, []),
        locationId: new FormControl(null, []),
        GLN: new FormControl(null, [])
      }),
      locationAsset: new FormGroup({
        location: new FormGroup({
          geometry: new FormGroup({
            coordinates: new FormArray([
              new FormGroup({
                lat: new FormControl(null, []),
                lng: new FormControl(null, [])
              })
            ])
          })
        }),
        name: new FormControl(null, []),
        city: new FormControl(null, []),
        country: new FormControl(null, []),
        locationId: new FormControl(null, []),
        GLN: new FormControl(null, [])
      })
    });
  }

  // Methods for adding new fields to the form

  remove(array, index: number) {
    (<FormArray>this.eventForm.get(array)).removeAt(index);
  }

  addDocument() {
    (<FormArray>this.eventForm.get('documents')).push(
      new FormGroup({
        documentTitle: new FormControl('', [Validators.required]),
        documentUrl: new FormControl('', [Validators.required])
      })
    );
  }

  addIdentifier() {
    (<FormArray>this.eventForm.get('identifiers')).push(
      new FormGroup({
        identifier: new FormControl('', [Validators.required]),
        identifierValue: new FormControl('', [Validators.required])
      })
    );
  }

  addCustomKeyValue() {
    (<FormArray>this.eventForm.get('customData')).push(
      new FormGroup({
        customDataKey: new FormControl('', [Validators.required]),
        customDataValue: new FormControl('', [Validators.required])
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
            groupItemValue: new FormControl('', [Validators.required])
          })
        ])
      })
    );
  }

  addCustomGroupKeyValue(i) {
    const groupsArray = this.eventForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).push(
      new FormGroup({
        groupItemKey: new FormControl('', [Validators.required]),
        groupItemValue: new FormControl('', [Validators.required])
      })
    );
  }

  onRemoveCustomGroupKeyValue(i, j) {
    const groupsArray = this.eventForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).removeAt(j);
  }

  errorsReset() {
    this.error = false;
    this.errorResponse = false;
    this.locationAssetError = false;
    this.locationEventError = false;
  }

  onSave() {
    if (this.eventForm.valid) {
      this.errorsReset();

      // Location Event
      const locationEvent = this.eventForm.get('locationEvent');
      let lat = locationEvent
        .get('location')
        .get('geometry')
        .get('coordinates')
        ['controls'][0].get('lat').value;
      let lng = locationEvent
        .get('location')
        .get('geometry')
        .get('coordinates')
        ['controls'][0].get('lng').value;
      let name = locationEvent.get('name').value;
      let city = locationEvent.get('city').value;
      let country = locationEvent.get('country').value;
      let locationId = locationEvent.get('locationId').value;
      let GLN = locationEvent.get('GLN').value;
      if ((lat || lat === 0) || (lng || lng === 0) || name || city || country || locationId || GLN) {
        if (!((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN)) {
          this.error = true;
          this.locationEventError = true;
          return;
        }
      }

      // Location Asset
      const locationAsset = this.eventForm.get('locationAsset');
      lat = locationAsset
        .get('location')
        .get('geometry')
        .get('coordinates')
        ['controls'][0].get('lat').value;
      lng = locationAsset
        .get('location')
        .get('geometry')
        .get('coordinates')
        ['controls'][0].get('lng').value;
      name = locationAsset.get('name').value;
      city = locationAsset.get('city').value;
      country = locationAsset.get('country').value;
      locationId = locationAsset.get('locationId').value;
      GLN = locationAsset.get('GLN').value;
      if ((lat || lat === 0) || (lng || lng === 0) || name || city || country || locationId || GLN) {
        if (!((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN)) {
          this.error = true;
          this.locationAssetError = true;
          return;
        }
      }

      this.spinner = true;

      // Create event for each selected asset
      const selectedAssets = this.assetService.getSelectedAssets();
      // Confirmation window
      const assetsString = selectedAssets.length > 1 ? 'assets' : 'asset';
      if (!confirm(`You are about to create an event for ${selectedAssets.length} ${assetsString}, are you sure you want to proceed?`)) {
        this.spinner = false;
        return;
      }
      this.assetService.addEventsJSON = this.generateJSON();
      this.assetService.addEvents();
    } else {
      this.error = true;
    }
  }

  private generateJSON() {
    const event = {};
    event['content'] = {};

    // event.content.idData
    event['content']['idData'] = {};
    event['content']['idData']['assetId'] = 'placeholder';
    event['content']['idData']['createdBy'] = this.storage.get('address');
    event['content']['idData']['accessLevel'] = 0;
    event['content']['idData']['timestamp'] = Math.floor(new Date().getTime() / 1000);

    // event.content.data
    event['content']['data'] = [];

    // Basic + custom data
    const basicAndCustom = {};
    // Basic data
    basicAndCustom['type'] = this.eventForm.get('type').value;
    basicAndCustom['name'] = this.eventForm.get('name').value;
    const description = this.eventForm.get('description').value;
    if (description) {
      basicAndCustom['description'] = description;
    }

    // Documents
    const documents = this.eventForm.get('documents')['controls'];
    if (documents.length > 0) {
      basicAndCustom['documents'] = {};
      documents.map((document) => {
        basicAndCustom['documents'][document.value.documentTitle] = {};
        basicAndCustom['documents'][document.value.documentTitle]['url'] = document.value.documentUrl;
      });
    }

    // Custom data
    this.eventForm.get('customData')['controls'].map((item) => {
      basicAndCustom[item.value.customDataKey] = item.value.customDataValue;
    });

    // Custom data groups
    const customGroups = this.eventForm.get('customDataGroups')['controls'];
    customGroups.map((item) => {
      basicAndCustom[item.value.groupName] = {};
      for (const group of item.get('groupValue')['controls']) {
        basicAndCustom[item.value.groupName][group.value.groupItemKey] = group.value.groupItemValue;
      }
    });

    event['content']['data'].push(basicAndCustom);

    // Identifiers
    const ide = this.eventForm.get('identifiers')['controls'];
    if (ide.length > 0) {
      const identifiers = {};
      identifiers['type'] = 'ambrosus.event.identifiers';
      ide.map((item) => {
        identifiers[item.value.identifier] = [];
        identifiers[item.value.identifier].push(item.value.identifierValue);
      });
      event['content']['data'].push(identifiers);
    }

    // Location Event
    const _locationEvent = this.eventForm.get('locationEvent');
    let lat = _locationEvent
      .get('location')
      .get('geometry')
      .get('coordinates')
      ['controls'][0].get('lat').value;
    let lng = _locationEvent
      .get('location')
      .get('geometry')
      .get('coordinates')
      ['controls'][0].get('lng').value;
    let name = _locationEvent.get('name').value;
    let city = _locationEvent.get('city').value;
    let country = _locationEvent.get('country').value;
    let locationId = _locationEvent.get('locationId').value;
    let GLN = _locationEvent.get('GLN').value;

    if ((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN) {
      const location = {
        type: 'ambrosus.event.location',
        location: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lat, lng]
          }
        },
        name: name,
        city: city,
        country: country,
        locationId: locationId,
        GLN: GLN
      };
      event['content']['data'].push(location);
    }

    // Location Asset
    const _locationAsset = this.eventForm.get('locationAsset');
    lat = _locationAsset
      .get('location')
      .get('geometry')
      .get('coordinates')
      ['controls'][0].get('lat').value;
    lng = _locationAsset
      .get('location')
      .get('geometry')
      .get('coordinates')
      ['controls'][0].get('lng').value;
    name = _locationAsset.get('name').value;
    city = _locationAsset.get('city').value;
    country = _locationAsset.get('country').value;
    locationId = _locationAsset.get('locationId').value;
    GLN = _locationAsset.get('GLN').value;

    if ((lat || lat === 0) && (lng || lng === 0) && name && city && country && locationId && GLN) {
      const location = {
        type: 'ambrosus.asset.location',
        location: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lat, lng]
          }
        },
        name: name,
        city: city,
        country: country,
        locationId: locationId,
        GLN: GLN
      };
      event['content']['data'].push(location);
    }

    return event;
  }
}
