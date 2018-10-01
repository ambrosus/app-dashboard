import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.scss'],
})
export class AssetFormComponent implements OnInit, OnDestroy {
  createAssetsSub: Subscription;
  createEventsSub: Subscription;
  assetForm: FormGroup;
  error;
  success;
  spinner;
  identifiersAutocomplete = ['UPCE', 'UPC12', 'EAN8', 'EAN13', 'CODE 39', 'CODE 128', 'ITF', 'QR', 'DATAMATRIX', 'RFID', 'NFC',
    'GTIN', 'GLN', 'SSCC', 'GSIN', 'GINC', 'GRAI', 'GIAI', 'GSRN', 'GDTI', 'GCN', 'CPID', 'GMN'];
  sequenceNumber = 0;

  @Input() prefill;
  @Input() assetId: String;

  isObject(value) { return typeof value === 'object'; }

  constructor(private storage: StorageService, private assetsService: AssetsService, private router: Router) { }

  emit(type) { window.dispatchEvent(new Event(type)); }

  ngOnInit() {
    this.initForm();
    if (this.prefill) { this.prefillForm(); }
  }

  ngOnDestroy() {
    if (this.createAssetsSub) { this.createAssetsSub.unsubscribe(); }
    if (this.createEventsSub) { this.createEventsSub.unsubscribe(); }
  }

  private initForm() {
    this.assetForm = new FormGroup({
      assetType: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      accessLevel: new FormControl(0, []),
      productImage: new FormArray([
        new FormGroup({
          imageName: new FormControl('default', []),
          imageUrl: new FormControl('', []),
        }),
      ]),
      identifiers: new FormArray([]),
      customData: new FormArray([]),
      customDataGroups: new FormArray([]),
    });
  }

  prefillForm() {
    const event = this.prefill;
    if (event.content && event.content.data && event.content.data.length > 0) {
      event.content.data.map(obj => {
        switch (obj.type) {
          case 'ambrosus.asset.identifiers':
            // Identifiers
            Object.keys(obj).map(key => {
              if (key === 'identifiers') {
                Object.keys(obj[key]).map(_key => {
                  (<FormArray>this.assetForm.get('identifiers')).push(
                    new FormGroup({
                      identifier: new FormControl(_key, [Validators.required]),
                      identifierValue: new FormControl(this.isObject(obj[key][_key]) ?
                        obj[key][_key][0] : obj[key][_key], [Validators.required]),
                    })
                  );
                });
              }
            });
            break;
          default:
            this.assetForm.get('assetType').setValue(obj.assetType || '');
            this.assetForm.get('name').setValue(obj.name);
            this.assetForm.get('description').setValue(obj.description || '');
            let i = 0;

            Object.keys(obj).map(key => {
              switch (this.isObject(obj[key])) {
                case true:
                  if (key === 'images') {
                    Object.keys(obj[key]).map(doc => {
                      if (doc === 'default') {
                        const productImages = this.assetForm.get('productImage')['controls'];
                        productImages[0].get('imageUrl').setValue(this.isObject(obj[key][doc]) ?
                          obj[key][doc]['url'] || '' : obj[key][doc] || '');
                      } else {
                        (<FormArray>this.assetForm.get('productImage')).push(
                          new FormGroup({
                            imageName: new FormControl(doc, [Validators.required]),
                            imageUrl: new FormControl(this.isObject(obj[key][doc]) ?
                              obj[key][doc]['url'] || '' : obj[key][doc] || '', [Validators.required]),
                          })
                        );
                      }
                    });
                  } else {
                    // Group (custom)
                    // Add a group
                    const customDataGroups = this.assetForm.get('customDataGroups') as FormArray;
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
                  if (key !== 'type' && key !== 'assetType' && key !== 'name' && key !== 'description') {
                    (<FormArray>this.assetForm.get('customData')).push(
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
  }

  // Methods for adding/removing new fields to the form

  remove(array, index: number) { (<FormArray>this.assetForm.get(array)).removeAt(index); }

  addImageUrl() {
    (<FormArray>this.assetForm.get('productImage')).push(
      new FormGroup({
        imageName: new FormControl('', [Validators.required]),
        imageUrl: new FormControl('', [Validators.required]),
      })
    );
  }

  addIdentifier() {
    (<FormArray>this.assetForm.get('identifiers')).push(
      new FormGroup({
        identifier: new FormControl('', [Validators.required]),
        identifierValue: new FormControl('', [Validators.required]),
      })
    );
  }

  addCustomKeyValue() {
    (<FormArray>this.assetForm.get('customData')).push(
      new FormGroup({
        customDataKey: new FormControl('', [Validators.required]),
        customDataValue: new FormControl('', [Validators.required]),
      })
    );
  }

  addCustomGroup() {
    const customDataGroups = this.assetForm.get('customDataGroups') as FormArray;
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
    const groupsArray = this.assetForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).push(
      new FormGroup({
        groupItemKey: new FormControl('', [Validators.required]),
        groupItemValue: new FormControl('', [Validators.required]),
      })
    );
  }

  onRemoveCustomGroupKeyValue(i, j) {
    const groupsArray = this.assetForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).removeAt(j);
  }

  private generateAsset() {
    const address = this.storage.get('user')['address'];
    const secret = this.storage.get('secret');

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
    const address = this.storage.get('user')['address'];
    const secret = this.storage.get('secret');

    const data = [];

    // Identifiers object
    const ide = this.assetForm.get('identifiers')['controls'];
    if (ide.length > 0) {
      const identifiers = {};
      identifiers['type'] = 'ambrosus.asset.identifiers';
      identifiers['identifiers'] = {};
      ide.map((item) => {
        identifiers['identifiers'][item.value.identifier] = [];
        identifiers['identifiers'][item.value.identifier].push(item.value.identifierValue);
      });

      data.push(identifiers);
    }

    // Info object
    const info = {};
    // Basic info
    info['type'] = 'ambrosus.asset.info';
    info['name'] = this.assetForm.get('name').value;
    info['assetType'] = this.assetForm.get('assetType').value;
    const description = this.assetForm.get('description').value;
    if (description) { info['description'] = description; }

    // Images
    const productImages = this.assetForm.get('productImage')['controls'];
    if (productImages.length > 0) {
      info['images'] = {};
      productImages.map((image, index, array) => {
        if (index === 0) {
          info['images']['default'] = {};
          info['images']['default']['url'] = productImages[index].value.imageUrl;
        } else {
          info['images'][productImages[index].value.imageName] = {};
          info['images'][productImages[index].value.imageName]['url'] = productImages[index].value.imageUrl;
        }
      });
    }

    // Custom data key-value
    this.assetForm.get('customData')['controls'].map(item => info[item.value.customDataKey] = item.value.customDataValue);

    // Custom data groups
    const customGroups = this.assetForm.get('customDataGroups')['controls'];
    customGroups.map(item => {
      info[item.value.groupName] = {};
      item.get('groupValue')['controls'].map(group => info[item.value.groupName][group.value.groupItemKey] = group.value.groupItemValue);
    });

    data.push(info);

    // Finish signing event

    const idData = {
      assetId: _assetId,
      timestamp: Math.floor(new Date().getTime() / 1000),
      accessLevel: this.assetForm.get('accessLevel').value,
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

    if (this.assetForm.valid) {
      if (!confirm(`Are you sure you want to proceed ${this.prefill && this.assetId ? 'editing' : 'creating'} this asset?`)) { return; }

      this.spinner = true;

      if (this.prefill && this.assetId) {
        // Edit info event
        const infoEvent = this.generateInfoEvent();
        this.createEventsSub = this.assetsService.createEvents([infoEvent]).subscribe(
          (resp: any) => {
            this.spinner = false;
            this.success = 'Success';
            this.emit('event:created');
          },
          err => {
            this.error = err.message;
            this.spinner = false;
            console.error('Info event edit error: ', err);
          }
        );
      } else {
        // Create asset and info event
        const asset = this.generateAsset();
        const infoEvent = this.generateInfoEvent(asset.assetId);
        this.createAssetsSub = this.assetsService.createAssets([asset], [infoEvent]).subscribe(
          (resp: any) => {
            this.spinner = false;
            this.success = 'Success';
            this.sequenceNumber += 1;
            this.emit('asset:created');
          },
          err => {
            this.error = err.message;
            this.spinner = false;
            console.error('Asset and info event create error: ', err);
          }
        );
      }
    } else { this.error = 'Please fill all required fields'; }
  }
}
