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
  errorResponse = false;
  success = false;
  spinner = false;
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
  json: string;

  constructor(
    private auth: AuthService,
    private assetService: AssetsService,
    private router: Router,
    private storage: StorageService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.assetService.inputChanged.subscribe((resp: any) => {
      resp.control.get('identifier').setValue(resp.value);
    });
  }

  private initForm() {
    this.assetForm = new FormGroup({
      assetType: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      productImage: new FormArray([]),
      identifiers: new FormArray([]),
      customData: new FormArray([]),
      customDataGroups: new FormArray([])
    });
  }

  // Methods for adding new fields to the form
  // Product images
  onAddImageUrl() {
    (<FormArray>this.assetForm.get('productImage')).push(
      new FormGroup({
        imageName: new FormControl('', [Validators.required]),
        imageUrl: new FormControl('', [Validators.required])
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
        identifier: new FormControl('', [Validators.required]),
        identifierValue: new FormControl('', [Validators.required])
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
        customDataKey: new FormControl('', [Validators.required]),
        customDataValue: new FormControl('', [Validators.required])
      })
    );
  }

  onRemoveCustomKeyValue(index: number) {
    (<FormArray>this.assetForm.get('customData')).removeAt(index);
  }

  // Custom data groups (group name: key-value)
  onAddCustomGroup() {
    const customDataGroups = this.assetForm.get(
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
    (<FormArray>this.assetForm.get('customDataGroups')).removeAt(index);
  }

  // Custom group data key-value pairs
  onAddCustomGroupKeyValue(i) {
    const groupsArray = this.assetForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).push(
      new FormGroup({
        groupItemKey: new FormControl('', [Validators.required]),
        groupItemValue: new FormControl('', [Validators.required])
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
      this.errorResponse = false;
      this.spinner = true;

      console.log(this.generateJSON('someassetID'));

      this.assetService.createAsset().subscribe(
        (resp: any) => {
          console.log('Asset creation successful ', resp);
          const assetId = resp.data.assetId;
          this.assetService
            .createEvent(assetId, this.generateJSON(assetId))
            .subscribe(
              (response: any) => {
                console.log('Assets event creation successful ', response);
                this.success = true;
                setTimeout(() => {
                  this.success = false;
                }, 3000);
                this.spinner = false;
              },
              error => {
                console.log('Assets event creation failed ', error);
                this.errorResponse = true;
                this.spinner = false;
              }
            );
        },
        err => {
          console.log('Asset creation failed ', err);
          this.errorResponse = true;
          this.spinner = false;
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
    asset['content']['idData']['timestamp'] = Math.floor(
      new Date().getTime() / 1000
    );

    // asset.content.data
    asset['content']['data'] = [];

    const identifiers = {};
    identifiers['type'] = 'ambrosus.asset.identifier';
    identifiers['identifiers'] = {};
    for (const item of this.assetForm.get('identifiers')['controls']) {
      identifiers['identifiers'][item.value.identifier] = [];
      identifiers['identifiers'][item.value.identifier].push(
        item.value.identifierValue
      );
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
    const productImages = this.assetForm.get('productImage')['controls'];
    if (productImages.length > 0) {
      basicAndCustom['images'] = {};
      for (let i = 0; i < productImages.length; i++) {
        if (i === 0) {
          basicAndCustom['images']['default'] = productImages[i].value.imageUrl;
          continue;
        }
        basicAndCustom['images'][productImages[i].value.imageName] =
          productImages[i].value.imageUrl;
      }
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
        basicAndCustom[item.value.groupName][group.value.groupItemKey] =
          group.value.groupItemValue;
      }
    }

    asset['content']['data'].push(basicAndCustom);

    const json = JSON.stringify(asset, null, 2);

    return asset;
    // this.json = json;
  }
}
