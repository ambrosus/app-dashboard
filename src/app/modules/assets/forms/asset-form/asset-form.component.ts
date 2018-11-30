import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { DomSanitizer } from '@angular/platform-browser';
import { autocomplete } from 'app/constant';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetFormComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  assetForm: FormGroup;
  error;
  success;
  spinner;
  autocomplete: any[] = autocomplete;
  sequenceNumber = 0;

  @Input() assetId: String;

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
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  to(P: Promise<any>) {
    return P.then(response => response).catch(error => ({ error }));
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

  cancel() {
    this.router.navigate([`${location.pathname}`]);
  }

  private initForm() {
    this.assetForm = new FormGroup({
      assetType: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null, []),
      accessLevel: new FormControl(0, []),
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
    });
  }

  // Methods for adding/removing new fields to the form

  remove(array, index: number) {
    (<FormArray>this.assetForm.get(array)).removeAt(index);
  }

  addImage(event, input) {
    if (event.keyCode === 13) {
      const value = event.target.value;
      const form = this.assetForm.value;
      let name = value.split('/');
      name = form.images.length ? name[name.length - 1] : 'default';
      if (value) {
        (<FormArray>this.assetForm.get('images')).push(
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
    (<FormArray>this.assetForm.get('identifiers')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  addProperty() {
    (<FormArray>this.assetForm.get('properties')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  addGroup() {
    (<FormArray>this.assetForm.get('groups')).push(
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
    const groups = <FormArray>this.assetForm.get('groups');
    (<FormArray>groups.at(i).get('content')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  removeGroupProperty(i, j) {
    const groups = <FormArray>this.assetForm.get('groups');
    (<FormArray>groups.at(i).get('content')).removeAt(j);
  }

  private generateAsset() {
    const address = this.storageService.get('account')['address'];
    const secret = this.storageService.get('secret');

    const idData = {
      timestamp: Math.floor(new Date().getTime() / 1000),
      sequenceNumber: this.sequenceNumber,
      createdBy: address,
    };

    const content = {
      idData,
      signature: this.assetsService.sign(idData, secret),
    };

    const asset = {
      assetId: this.assetsService.calculateHash(content),
      content,
    };

    return asset;
  }

  private generateInfoEvent(_assetId = this.assetId) {
    const address = this.storageService.get('account')['address'];
    const secret = this.storageService.get('secret');
    const assetForm = this.assetForm.getRawValue();

    const data = [];

    // Identifiers object
    const ide = assetForm.identifiers;
    if (ide.length > 0) {
      const identifiers = {};
      identifiers['type'] = 'ambrosus.asset.identifiers';
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

    info['type'] = 'ambrosus.asset.info';
    info['name'] = assetForm.name;
    info['assetType'] = assetForm.assetType;
    const description = assetForm.description;
    if (description) {
      info['description'] = description;
    }

    // Images
    const images = assetForm.images;
    if (images.length > 0) {
      const _images = {};
      images.map((image, index, array) => {
        if (image.name && image.url) {
          _images[image.name] = {};
          _images[image.name]['url'] = image.url;
        }
      });

      if (Object.keys(_images).length) {
        info['images'] = _images;
      }
    }

    // Properties
    assetForm.properties.map(item => {
      if (item.name && item.value) {
        info[item.name] = item.value;
      }
    });

    // Groups
    const groups = assetForm.groups;
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

    // Finish signing event

    const idData = {
      assetId: _assetId,
      timestamp: Math.floor(new Date().getTime() / 1000),
      accessLevel: assetForm.accessLevel,
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
    const form = this.assetForm;
    this.error = false;
    this.success = false;

    if (form.invalid) {
      return (this.error = 'Please fill required fields');
    }

    if (!confirm(`Are you sure you want to proceed creating this asset?`)) {
      return;
    }

    const asset = this.generateAsset();
    const infoEvent = this.generateInfoEvent(asset.assetId);

    console.log('Creating asset');
    this.assetsService.createAsset(asset).subscribe(
      async response => {
        this.sequenceNumber += 1;

        console.log('Creating event');
        const eventsCreated = await this.to(
          this.assetsService.createEvents([infoEvent]),
        );
        this.success = 'Success';
      },
      error => (this.error = 'Asset creation failed, aborting'),
    );
  }
}
