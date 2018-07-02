import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  Renderer2
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { AssetsService } from 'app/services/assets.service';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventAddComponent implements OnInit, OnDestroy {
  eventForm: FormGroup;
  error = false;
  errorResponse = false;
  success = false;
  spinner = false;
  locationError = false;
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

  constructor(
    private auth: AuthService,
    private assetService: AssetsService,
    private router: Router,
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
  }

  tabOpen(open, element) {
    this.json = open === 'form' ? false : true;
    const tabHeaderItems = this.el.nativeElement.querySelectorAll(
      '.tab_header_item'
    );
    for (const item of tabHeaderItems) {
      this.renderer.removeClass(item, 'active');
    }
    this.renderer.addClass(element, 'active');
  }

  ngOnDestroy() {
    /* this.assetService.unselectAssets(); */
  }

  private initForm() {
    this.eventForm = new FormGroup({
      eventType: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      documents: new FormArray([]),
      identifiers: new FormArray([]),
      customData: new FormArray([]),
      customDataGroups: new FormArray([]),
      location: new FormGroup({
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
        gln: new FormControl(null, [])
      })
    });
  }

  // Methods for adding new fields to the form
  // Product images
  onAddDocument() {
    (<FormArray>this.eventForm.get('documents')).push(
      new FormGroup({
        documentTitle: new FormControl('', [Validators.required]),
        documentUrl: new FormControl('', [Validators.required])
      })
    );
  }

  onRemoveDocument(index: number) {
    (<FormArray>this.eventForm.get('documents')).removeAt(index);
  }

  // Identifiers
  onAddIdentifier() {
    (<FormArray>this.eventForm.get('identifiers')).push(
      new FormGroup({
        identifier: new FormControl('', [Validators.required]),
        identifierValue: new FormControl('', [Validators.required])
      })
    );
  }

  onRemoveIdentifier(index: number) {
    (<FormArray>this.eventForm.get('identifiers')).removeAt(index);
  }

  // Custom data (key-value)
  onAddCustomKeyValue() {
    (<FormArray>this.eventForm.get('customData')).push(
      new FormGroup({
        customDataKey: new FormControl('', [Validators.required]),
        customDataValue: new FormControl('', [Validators.required])
      })
    );
  }

  onRemoveCustomKeyValue(index: number) {
    (<FormArray>this.eventForm.get('customData')).removeAt(index);
  }

  // Custom data groups (group name: key-value)
  onAddCustomGroup() {
    const customDataGroups = this.eventForm.get(
      'customDataGroups'
    ) as FormArray;
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

  onRemoveCustomGroup(index: number) {
    (<FormArray>this.eventForm.get('customDataGroups')).removeAt(index);
  }

  // Custom group data key-value pairs
  onAddCustomGroupKeyValue(i) {
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

  onSave() {
    if (this.eventForm.valid) {
      this.error = false;
      this.errorResponse = false;
      this.locationError = false;

      // Check for location error
      const location = this.eventForm.get('location');
      const lat = location
        .get('location')
        .get('geometry')
        .get('coordinates')
        ['controls'][0].get('lat').value;
      const lng = location
        .get('location')
        .get('geometry')
        .get('coordinates')
        ['controls'][0].get('lng').value;
      const name = location.get('name').value;
      const city = location.get('city').value;
      const country = location.get('country').value;
      const locationId = location.get('locationId').value;
      const GLN = location.get('gln').value;
      if (lat || lng || name || city || country || locationId || GLN) {
        if (!(lat && lng && name && city && country && locationId && GLN)) {
          this.error = true;
          this.locationError = true;
          return;
        }
      }

      this.spinner = true;

      /* console.log(JSON.stringify(this.generateJSON('123'), null, 4)); */

      // create event for each selected asset
      const selectedAssets = this.assetService.getSelectedAssets();
      // Confirmation window
      const assetsString = selectedAssets.length > 1 ? 'assets' : 'asset';
      if (
        !confirm(
          `You are about to create an event for ${
            selectedAssets.length
          } ${assetsString}, are you sure you want to proceed?`
        )
      ) {
        this.spinner = false;
        return;
      }
      for (const assetId of selectedAssets) {
        // Creating events
        this.assetService
          .createEvent(assetId, this.generateJSON(assetId))
          .subscribe(
            (response: any) => {
              console.log(
                'Assets event creation successful ',
                assetId,
                response
              );
              this.success = true;
              setTimeout(() => {
                this.success = false;
              }, 3000);
            },
            error => {
              console.log('Assets event creation failed ', assetId, error);
            }
          );
      }
      this.assetService.unselectAssets();
      this.spinner = false;
    } else {
      this.error = true;
    }
  }

  private generateJSON(assetId: string) {
    const event = {};
    event['content'] = {};

    // event.content.idData
    event['content']['idData'] = {};
    event['content']['idData']['assetId'] = assetId;
    event['content']['idData']['createdBy'] = this.storage.get('address');
    event['content']['idData']['accessLevel'] = 0;
    event['content']['idData']['timestamp'] = Math.floor(
      new Date().getTime() / 1000
    );

    // event.content.data
    event['content']['data'] = [];

    // Basic + custom data
    const basicAndCustom = {};
    // Basic data
    basicAndCustom['type'] = this.eventForm.get('eventType').value;
    basicAndCustom['name'] = this.eventForm.get('name').value;
    basicAndCustom['description'] = this.eventForm.get('description').value;
    // Documents
    const documents = this.eventForm.get('documents')['controls'];
    if (documents.length > 0) {
      basicAndCustom['documents'] = {};
      for (const item of documents) {
        basicAndCustom['documents'][item.value.documentTitle] =
          item.value.documentUrl;
      }
    }
    // Custom data
    for (const item of this.eventForm.get('customData')['controls']) {
      basicAndCustom[item.value.customDataKey] = item.value.customDataValue;
    }
    // Custom data groups
    const customGroups = this.eventForm.get('customDataGroups')['controls'];
    for (const item of customGroups) {
      basicAndCustom[item.value.groupName] = {};
      for (const group of item.get('groupValue')['controls']) {
        basicAndCustom[item.value.groupName][group.value.groupItemKey] =
          group.value.groupItemValue;
      }
    }

    event['content']['data'].push(basicAndCustom);

    // Identifiers
    // FIX AWAITING FROM API
    /* const ide = this.eventForm.get('identifiers')['controls'];
    if (ide.length > 0) {
      const identifiers = {};
      identifiers['type'] = 'ambrosus.event.identifiers';
      identifiers['identifiers'] = {};
      for (const item of ide) {
        identifiers['identifiers'][item.value.identifier] = [];
        identifiers['identifiers'][item.value.identifier].push(
          item.value.identifierValue
        );
      }
      event['content']['data'].push(identifiers);
    } */

    // Location
    const _location = this.eventForm.get('location');
    const lat = _location
      .get('location')
      .get('geometry')
      .get('coordinates')
      ['controls'][0].get('lat').value;
    const lng = _location
      .get('location')
      .get('geometry')
      .get('coordinates')
      ['controls'][0].get('lng').value;
    const name = _location.get('name').value;
    const city = _location.get('city').value;
    const country = _location.get('country').value;
    const locationId = _location.get('locationId').value;
    const GLN = _location.get('gln').value;

    if (lat && lng && name && city && country && locationId && GLN) {
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

    const json = JSON.stringify(event, null, 2);

    return event;
  }
}
