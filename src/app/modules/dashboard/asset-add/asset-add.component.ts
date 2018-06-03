import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "app/services/auth.service";
import {AssetsService} from 'app/services/assets.service';
import {Router} from '@angular/router';

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

  constructor(private auth: AuthService,
              private assets: AssetsService,
              private router: Router) {
    this.initForm();
  }

  ngOnInit() {
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
    console.log(this.assetForm);
    if (!this.assetForm.valid) {
      this.error = true;
      console.log(this.assetForm.errors);
    }

    if (this.assetForm.valid) {
      this.error = false;

      console.log(this.assetForm.value);
      console.log(JSON.stringify(this.assetForm.value));
    }
  }
}
