import { StorageService } from 'app/services/storage.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { AssetsService } from 'app/services/assets.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-add',
  templateUrl: './asset-add.component.html',
  styleUrls: ['./asset-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetAddComponent implements OnInit {
  assetForm: FormGroup;
  error = false;
  spinner = false;
  identifiersAutocomplete = [
    'UPCE', 'UPC12', 'EAN8', 'EAN13', 'CODE 39', 'CODE 128', 'ITF', 'QR',
    'DATAMATRIX', 'RFID', 'NFC', 'GTIN', 'GLN', 'SSCC', 'GSIN', 'GINC', 'GRAI',
    'GIAI', 'GSRN', 'GDTI', 'GCN', 'CPID', 'GMN'
  ];
  json: string;

  constructor(private auth: AuthService,
    private assets: AssetsService,
    private router: Router,
    private storage: StorageService) {
    this.initForm();
  }

  ngOnInit() {
    this.assets.inputChanged.subscribe(
      (resp: any) => {
        resp.control.get('identifier').setValue(resp.value);
      }
    );
  }

  private initForm() {
    this.assetForm = new FormGroup({
      'assetType': new FormControl(null, [Validators.required]),
      'name': new FormControl(null, [Validators.required]),
      'description': new FormControl(null, []),
      'productImage': new FormArray([
        new FormGroup({
          'imageName': new FormControl('default', []),
          'imageUrl': new FormControl(null, [])
        })
      ]),
      'identifiers': new FormArray([
        new FormGroup({
          'identifier': new FormControl(null, []),
          'identifierValue': new FormControl(null, [])
        })
      ]),
      'customData': new FormArray([
        new FormGroup({
          'customDataKey': new FormControl(null, []),
          'customDataValue': new FormControl(null, [])
        })
      ]),
      'customDataGroups': new FormArray([
        new FormGroup({
          'groupName': new FormControl(null, []),
          'groupValue': new FormArray([
            new FormGroup({
              'groupItemKey': new FormControl(null, []),
              'groupItemValue': new FormControl(null, [])
            })
          ])
        })
      ])
    });
  }

  // Methods for adding new fields to the form
  // Product images
  onAddImageUrl() {
    (<FormArray>this.assetForm.get('productImage')).push(
      new FormGroup({
        'imageName': new FormControl(null, []),
        'imageUrl': new FormControl(null, [])
      })
    );
  }

  onRemoveImageUrl(index: number) {
    (<FormArray>this.assetForm.get('productImage')).removeAt(index);
  }

  // Identifiers
  onAddIdentifier() {
    (<FormArray>this.assetForm.get('identifiers')).push(
      new FormGroup({
        'identifier': new FormControl(null, []),
        'identifierValue': new FormControl(null, [])
      })
    );
  }

  onRemoveIdentifier(index: number) {
    (<FormArray>this.assetForm.get('identifiers')).removeAt(index);
  }

  // Custom data (key-value)
  onAddCustomKeyValue() {
    (<FormArray>this.assetForm.get('customData')).push(
      new FormGroup({
        'customDataKey': new FormControl(null, []),
        'customDataValue': new FormControl(null, [])
      })
    );
  }

  onRemoveCustomKeyValue(index: number) {
    (<FormArray>this.assetForm.get('customData')).removeAt(index);
  }

  // Custom data groups (group name: key-value)
  onAddCustomGroup() {
    const customDataGroups = this.assetForm.get('customDataGroups') as FormArray;
    (<FormArray>customDataGroups).push(
      new FormGroup({
        'groupName': new FormControl(null, []),
        'groupValue': new FormArray([
          new FormGroup({
            'groupItemKey': new FormControl(null, []),
            'groupItemValue': new FormControl(null, [])
          })
        ])
      })
    );
  }

  onRemoveCustomGroup(index: number) {
    (<FormArray>this.assetForm.get('customDataGroups')).removeAt(index);
  }

  // Custom group data key-value pairs
  onAddCustomGroupKeyValue(i) {
    const groupsArray = this.assetForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).push(
      new FormGroup({
        'groupItemKey': new FormControl(null, []),
        'groupItemValue': new FormControl(null, [])
      })
    );
  }

  onRemoveCustomGroupKeyValue(i, j) {
    const groupsArray = this.assetForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).removeAt(j);
  }

  onSave() {
    if (this.assetForm.valid) {
      this.error = false;

      // create asset
      this.storage.createAsset().subscribe(
        (resp: any) => {
          console.log('resp ', resp);
          const body = this.generateJSON(resp.assetId);
          this.storage.createEvent(body, resp.assetId).subscribe(
            _resp => {
              console.log('resp ', resp);
            },
            err => {
              console.log('err ', err);
            }
          );
        },
        err => {
          console.log('err ', err);
          this.error = true;
        }
      );
    } else {
      this.error = true;
    }
  }

  private generateJSON(assetId: string) {
    const asset = {};
    asset['content'] = {};

    // asset.content.idData
    asset['content']['idData'] = {};
    asset['content']['idData']['assetId'] = assetId;
    asset['content']['idData']['createdBy'] = this.storage.get('address');
    asset['content']['idData']['accessLevel'] = 0;
    asset['content']['idData']['timestamp'] = new Date().getTime() / 1000;

    // asset.content.data
    asset['content']['data'] = [];

    const identifiers = {};
    identifiers['type'] = 'ambrosus.asset.identifier';
    identifiers['identifiers'] = {};
    for (const item of this.assetForm.get('identifiers')['controls']) {
      identifiers['identifiers'][item.value.identifier] = [];
      identifiers['identifiers'][item.value.identifier].push(item.value.identifierValue);
    }

    asset['content']['data'].push(identifiers);

    // Basic + custom data
    const basicAndCustom = {};
    // Basic data
    basicAndCustom['type'] = 'ambrosus.asset.info';
    basicAndCustom['name'] = this.assetForm.get('name').value;
    basicAndCustom['description'] = this.assetForm.get('description').value;
    basicAndCustom['assetType'] = this.assetForm.get('assetType').value;
    // Images
    basicAndCustom['images'] = {};
    const productImages = this.assetForm.get('productImage')['controls'];
    for (let i = 0; i < productImages.length; i++) {
      if (i === 0) {
        basicAndCustom['images']['default'] = productImages[i].value.imageUrl;
        continue;
      }
      basicAndCustom['images'][productImages[i].value.imageName] = productImages[i].value.imageUrl;
    }
    // Custom data
    for (const item of this.assetForm.get('customData')['controls']) {
      basicAndCustom[item.value.customDataKey] = item.value.customDataValue;
    }
    // Custom data groups
    const customGroups = this.assetForm.get('customDataGroups')['controls'];
    for (const item of customGroups) {
      basicAndCustom[item.value.groupName] = {};
      for (const group of item.get('groupValue')['controls']) {
        basicAndCustom[item.value.groupName][group.value.groupItemKey] = group.value.groupItemValue;
      }
    }

    asset['content']['data'].push(basicAndCustom);

    const json = JSON.stringify(asset, null, 2);

    return json;
    // this.json = json;
  }
}
