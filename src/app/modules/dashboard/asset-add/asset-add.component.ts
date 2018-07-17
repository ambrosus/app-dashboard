import { StorageService } from 'app/services/storage.service';
import { Component, OnInit, ViewEncapsulation, ElementRef, Renderer2, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AssetsService } from 'app/services/assets.service';

@Component({
  selector: 'app-asset-add',
  templateUrl: './asset-add.component.html',
  styleUrls: ['./asset-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetAddComponent implements OnInit {
  assetForm: FormGroup;
  error = false;
  invalidJSON = false;
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
  json = false;
  errorJSON = false;
  textArea: any = '';
  buttonText = 'Create asset';

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
    // Info event success
    this.assetService.infoEventCreated.subscribe(resp => {
      this.success = true;
      setTimeout(() => {
        this.success = false;
      }, 3000);
      this.spinner = false;
    });
    // Asset or info event fail
    this.assetService.infoEventFailed.subscribe(resp => {
      this.errorResponse = true;
      this.spinner = false;
    });
    // prefill the form
    if (this.prefill && this.assetId) {
      this.assetService.selectAsset(this.assetId);
      this.prefillForm();
      this.buttonText = 'Edit info event';
    }
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
                        obj[key][_key][0] : obj[key][_key], [Validators.required])
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
                              obj[key][doc]['url'] || '' : obj[key][doc] || '', [Validators.required])
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
                  if (key !== 'type' && key !== 'assetType' && key !== 'name' && key !== 'description') {
                    (<FormArray>this.assetForm.get('customData')).push(
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
  }

  validJSON(input) {
    try {
      JSON.parse(input.value);
      this.errorJSON = false;
    } catch (error) {
      this.errorJSON = true;
    }
  }

  tabOpen(open, element) {
    this.json = open === 'form' ? false : true;
    const tabHeaderItems = this.el.nativeElement.querySelectorAll('.tab_header_item');
    for (const item of tabHeaderItems) {
      this.renderer.removeClass(item, 'active');
    }
    this.renderer.addClass(element, 'active');
  }

  uploadJSON(event) {
    const file = event.target.files[0];
    const that = this;

    const reader = new FileReader();

    reader.onload = function(e) {
      const text = reader.result;
      that.textArea = text;
    };
    reader.readAsText(file);
  }

  insertTab(e, jsonInput) {
    if (e.keyCode === 9) {
      const start = jsonInput.selectionStart;
      const end = jsonInput.selectionEnd;

      const value = jsonInput.value;

      // set textarea value to: text before caret + tab + text after caret
      jsonInput.value = `${value.substring(0, start)}\t${value.substring(end)}`;

      // put caret at right position again (add one for the tab)
      jsonInput.selectionStart = jsonInput.selectionEnd = start + 1;

      // prevent the focus lose
      e.preventDefault();
    }
  }

  private initForm() {
    this.assetForm = new FormGroup({
      assetType: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      productImage: new FormArray([
        new FormGroup({
          imageName: new FormControl('default', [Validators.required]),
          imageUrl: new FormControl('', [Validators.required])
        })
      ]),
      identifiers: new FormArray([]),
      customData: new FormArray([]),
      customDataGroups: new FormArray([])
    });
  }

  // Methods for adding/removing new fields to the form
  remove(array, index: number) {
    (<FormArray>this.assetForm.get(array)).removeAt(index);
  }

  addImageUrl() {
    (<FormArray>this.assetForm.get('productImage')).push(
      new FormGroup({
        imageName: new FormControl('', [Validators.required]),
        imageUrl: new FormControl('', [Validators.required])
      })
    );
  }

  addIdentifier() {
    (<FormArray>this.assetForm.get('identifiers')).push(
      new FormGroup({
        identifier: new FormControl('', [Validators.required]),
        identifierValue: new FormControl('', [Validators.required])
      })
    );
  }

  addCustomKeyValue() {
    (<FormArray>this.assetForm.get('customData')).push(
      new FormGroup({
        customDataKey: new FormControl('', [Validators.required]),
        customDataValue: new FormControl('', [Validators.required])
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
            groupItemValue: new FormControl('', [Validators.required])
          })
        ])
      })
    );
  }

  addCustomGroupKeyValue(i) {
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

  errorsReset() {
    this.error = false;
    this.errorResponse = false;
    this.invalidJSON = false;
  }

  onJSONSave(input) {
    const json = input.value;
    if (json) {
      this.errorsReset();
      let data;

      try {
        data = JSON.parse(json);
      } catch (e) {
        this.invalidJSON = true;
        return;
      }

      this.spinner = true;

      this.assetService.createAsset(data).subscribe(
        (resp: any) => {
          console.log('Asset and events created: ', resp);
          this.success = true;
          setTimeout(() => {
            this.success = false;
          }, 3000);
          this.spinner = false;
        },
        error => {
          console.log('Asset and event creation failed: ', error);
          this.errorResponse = true;
          this.spinner = false;
        }
      );
    } else {
      this.error = true;
    }
  }

  onSave() {
    if (this.assetForm.valid) {
      this.errorsReset();
      this.spinner = true;

      if (this.prefill && this.assetId) {
        // Edit info event
        this.assetService.editInfoEventJSON = this.generateJSON('assetId');
        this.assetService.editInfoEvent();
      } else {
        // Create asset and info event
        this.assetService.addAssetAndInfoEventJSON = this.generateJSON('assetId');
        this.assetService.addAssetAndInfoEvent();
      }
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
    asset['content']['idData']['timestamp'] = Math.floor(new Date().getTime() / 1000);

    // asset.content.data
    asset['content']['data'] = [];

    // Identifiers
    const ide = this.assetForm.get('identifiers')['controls'];
    if (ide.length > 0) {
      const identifiers = {};
      identifiers['type'] = 'ambrosus.asset.identifiers';
      identifiers['identifiers'] = {};
      ide.map((item) => {
        identifiers['identifiers'][item.value.identifier] = [];
        identifiers['identifiers'][item.value.identifier].push(item.value.identifierValue);
      });

      asset['content']['data'].push(identifiers);
    }

    // Basic + custom data
    const basicAndCustom = {};
    // Basic data
    basicAndCustom['type'] = 'ambrosus.asset.info';
    basicAndCustom['name'] = this.assetForm.get('name').value;
    basicAndCustom['assetType'] = this.assetForm.get('assetType').value;
    const description = this.assetForm.get('description').value;
    if (description) {
      basicAndCustom['description'] = description;
    }

    // Images
    const productImages = this.assetForm.get('productImage')['controls'];
    if (productImages.length > 0) {
      basicAndCustom['images'] = {};
      for (let i = 0; i < productImages.length; i++) {
        if (i === 0) {
          basicAndCustom['images']['default'] = {};
          basicAndCustom['images']['default']['url'] = productImages[i].value.imageUrl;
          continue;
        }
        basicAndCustom['images'][productImages[i].value.imageName] = {};
        basicAndCustom['images'][productImages[i].value.imageName]['url'] = productImages[i].value.imageUrl;
      }
    }

    // Custom data
    this.assetForm.get('customData')['controls'].map((item) => {
      basicAndCustom[item.value.customDataKey] = item.value.customDataValue;
    });

    // Custom data groups
    const customGroups = this.assetForm.get('customDataGroups')['controls'];
    customGroups.map((item) => {
      basicAndCustom[item.value.groupName] = {};
      for (const group of item.get('groupValue')['controls']) {
        basicAndCustom[item.value.groupName][group.value.groupItemKey] = group.value.groupItemValue;
      }
    });

    asset['content']['data'].push(basicAndCustom);

    return asset;
  }
}
