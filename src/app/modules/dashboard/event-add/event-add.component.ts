import { StorageService } from 'app/services/storage.service';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { AssetsService } from 'app/services/assets.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventAddComponent implements OnInit, OnDestroy {
  eventForm: FormGroup;
  error = false;
  spinner = false;
  identifierTypes = [
    'UPCE', 'UPC12', 'EAN8', 'EAN13', 'CODE 39', 'CODE 128', 'ITF', 'QR',
    'DATAMATRIX', 'RFID', 'NFC', 'GTIN', 'GLN', 'SSCC', 'GSIN', 'GINC', 'GRAI',
    'GIAI', 'GSRN', 'GDTI', 'GCN', 'CPID', 'GMN'
  ];
  eventObjectTypes = [
    'ambrosus.asset.info', 'ambrosus.asset.identifier'
  ];
  json;

  constructor(private auth: AuthService,
    private assets: AssetsService,
    private router: Router,
    private storage: StorageService) {
    this.initForm();
  }

  ngOnInit() {
    this.assets.inputChanged.subscribe(
      (resp: any) => {
        resp.control.setValue(resp.value);
      }
    );
    /* if (this.assets.getSelectedAssets().length === 0) {
      alert(`You didn\'t select any assets. Please do so on ${location.hostname}/assets`);
      this.router.navigate(['/assets']);
    } */
  }

  ngOnDestroy() {
    this.assets.unselectAssets();
  }

  private initForm() {
    this.eventForm = new FormGroup({
      'form': new FormArray([
        /* new FormGroup({
          'eventObjectType': new FormControl('ambrosus.asset.info', [Validators.required]),
          'data': new FormArray([
            new FormGroup({
              'keyValue': new FormArray([
                new FormGroup({
                  'keyValueKey': new FormControl(),
                  'keyValueValue': new FormControl()
                })
              ]),
            }),
            new FormGroup({
              'groupKeyValue': new FormArray([
                new FormGroup({
                  'groupKeyValueTitle': new FormControl(),
                  'groupKeyValueObject': new FormArray([
                    new FormGroup({
                      'groupKeyValueItemKey': new FormControl(),
                      'groupKeyValueItemValue': new FormControl()
                    })
                  ])
                })
              ])
            }),
            new FormGroup({
              'groupKeyObjectKeyValue': new FormArray([
                new FormGroup({
                  'groupKeyObjectKeyValueTitle': new FormControl(),
                  'groupKeyObjectKeyValueObject': new FormArray([
                    new FormGroup({
                      'groupKeyObjectKeyValueItemTitle': new FormControl(),
                      'groupKeyObjectKeyValueItemObject': new FormArray([
                        new FormGroup({
                          'groupKeyObjectKeyValueItemKey': new FormControl(),
                          'groupKeyObjectKeyValueItemValue': new FormControl()
                        })
                      ])
                    })
                  ])
                })
              ])
            }),
            new FormGroup({
              'location': new FormGroup({
                'typeLocation': new FormControl(),
                'geometry': new FormGroup({
                  'typeGeometry': new FormControl(),
                  'coordinates': new FormArray([
                    new FormGroup({
                      'latitude': new FormControl(),
                      'longitude': new FormControl()
                    })
                  ])
                })
              })
            })
          ])
        }),
        new FormGroup({
          'eventObjectType': new FormControl('ambrosus.asset.identifier', [Validators.required]),
          'data': new FormArray([
            new FormGroup({
              'identifiers': new FormArray([
                new FormGroup({
                  'identifierType': new FormControl(),
                  'identifierValue': new FormControl()
                })
              ])
            })
          ])
        }) */
      ])
    });
  }

  // Methods for adding and removing inputs
  // Most important, add event object
  addEventObject(array: FormArray) {
    array.push(
      new FormGroup({
        'eventObjectType': new FormControl('', [Validators.required]),
        'data': new FormArray([])
      })
    );
  }

  // Same for all
  remove(array: FormArray, index) {
    array.removeAt(index);
  }

  // key: value
  addKeyValue(array: FormArray) {
    array.push(
      new FormGroup({
        'keyValueKey': new FormControl(),
        'keyValueValue': new FormControl()
      }),
    );
  }

  // Group with key: value
  addGroupKeyValue(array: FormArray) {
    array.push(
      new FormGroup({
        'groupKeyValueTitle': new FormControl(),
        'groupKeyValueObject': new FormArray([
          new FormGroup({
            'groupKeyValueItemKey': new FormControl(),
            'groupKeyValueItemValue': new FormControl()
          })
        ])
      })
    );
  }
  addGroupKeyValueItem(array: FormArray) {
    array.push(
      new FormGroup({
        'groupKeyValueItemKey': new FormControl(),
        'groupKeyValueItemValue': new FormControl()
      })
    );
  }

  // Group with key: object: key: value
  addGroupKeyObjectKeyValue(array: FormArray) {
    array.push(
      new FormGroup({
        'groupKeyObjectKeyValueTitle': new FormControl(),
        'groupKeyObjectKeyValueObject': new FormArray([
          new FormGroup({
            'groupKeyObjectKeyValueItemTitle': new FormControl(),
            'groupKeyObjectKeyValueItemObject': new FormArray([
              new FormGroup({
                'groupKeyObjectKeyValueItemKey': new FormControl(),
                'groupKeyObjectKeyValueItemValue': new FormControl()
              })
            ])
          })
        ])
      })
    );
  }
  addGroupKeyObjectKeyValueItem(array: FormArray) {
    array.push(
      new FormGroup({
        'groupKeyObjectKeyValueItemTitle': new FormControl(),
        'groupKeyObjectKeyValueItemObject': new FormArray([
          new FormGroup({
            'groupKeyObjectKeyValueItemKey': new FormControl(),
            'groupKeyObjectKeyValueItemValue': new FormControl()
          })
        ])
      })
    );
  }
  addGroupKeyObjectKeyValueItemKeyValue(array: FormArray) {
    array.push(
      new FormGroup({
        'groupKeyObjectKeyValueItemKey': new FormControl(),
        'groupKeyObjectKeyValueItemValue': new FormControl()
      })
    );
  }

  // Identifiers
  addIdentifier(array: FormArray) {
    array.push(
      new FormGroup({
        'identifierType': new FormControl(),
        'identifierValue': new FormControl()
      })
    );
  }

  // Inputs
  addInputLocation(array: FormArray) {
    array.push(
      new FormGroup({
        'location': new FormGroup({
          'typeLocation': new FormControl(),
          'geometry': new FormGroup({
            'typeGeometry': new FormControl(),
            'coordinates': new FormArray([
              new FormGroup({
                'latitude': new FormControl(),
                'longitude': new FormControl()
              })
            ])
          })
        })
      })
    );
  }
  addInputKeyValue(array: FormArray) {
    array.push(
      new FormGroup({
        'keyValue': new FormArray([
          new FormGroup({
            'keyValueKey': new FormControl(),
            'keyValueValue': new FormControl()
          })
        ]),
      })
    );
  }
  addInputGroupKeyValue(array: FormArray) {
    array.push(
      new FormGroup({
        'groupKeyValue': new FormArray([
          new FormGroup({
            'groupKeyValueTitle': new FormControl(),
            'groupKeyValueObject': new FormArray([
              new FormGroup({
                'groupKeyValueItemKey': new FormControl(),
                'groupKeyValueItemValue': new FormControl()
              })
            ])
          })
        ])
      })
    );
  }
  addInputGroupKeyObjectKeyValue(array: FormArray) {
    array.push(
      new FormGroup({
        'groupKeyObjectKeyValue': new FormArray([
          new FormGroup({
            'groupKeyObjectKeyValueTitle': new FormControl(),
            'groupKeyObjectKeyValueObject': new FormArray([
              new FormGroup({
                'groupKeyObjectKeyValueItemTitle': new FormControl(),
                'groupKeyObjectKeyValueItemObject': new FormArray([
                  new FormGroup({
                    'groupKeyObjectKeyValueItemKey': new FormControl(),
                    'groupKeyObjectKeyValueItemValue': new FormControl()
                  })
                ])
              })
            ])
          })
        ])
      })
    );
  }
  addInputIndentifiers(array: FormArray) {
    array.push(
      new FormGroup({
        'identifiers': new FormArray([
          new FormGroup({
            'identifierType': new FormControl(),
            'identifierValue': new FormControl()
          })
        ])
      })
    );
  }

  onSave() {
    if (this.eventForm.valid) {
      this.error = false;

      // create event for each selected asset
      /*  const selectedAssets = this.assets.getSelectedAssets();
       for (const assetId of selectedAssets) {
         const body = this.generateJSON(assetId);
         this.assets.createEvent(body, assetId).subscribe(
           resp => {
             console.log('resp ', resp);
           },
           err => {
             console.log('err ', err);
           }
         );
       } */
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

    // Loop through event objects
    for (const eventObject of this.eventForm.get('form')['controls']) {
      const eventObjectType = eventObject.get('eventObjectType').value;
      if (eventObjectType && eventObjectType === 'ambrosus.asset.info') {

        const info = {};
        info['type'] = eventObjectType;

        for (const section of eventObject.get('data')['controls']) {

          const sectionType = Object.keys(section.value)[0];

          // If FormGroup is keyValue
          if (sectionType === 'keyValue') {
            for (const item of section.get('keyValue')['controls']) {
              info[item.get('keyValueKey').value] = item.get('keyValueValue').value;
            }
          }

          // If FormGroup is groupKeyValue
          if (sectionType === 'groupKeyValue') {
            for (const group of section.get('groupKeyValue')['controls']) {
              info[group.get('groupKeyValueTitle').value] = {};
              for (const item of group.get('groupKeyValueObject')['controls']) {
                info[group.get('groupKeyValueTitle').value][item.get('groupKeyValueItemKey').value] = item.get('groupKeyValueItemValue').value;
              }
            }
          }

          // If FormGroup is groupKeyObjectKeyValue
          if (sectionType === 'groupKeyObjectKeyValue') {
            for (const group of section.get('groupKeyObjectKeyValue')['controls']) {
              info[group.get('groupKeyObjectKeyValueTitle').value] = {};
              for (const item of group.get('groupKeyObjectKeyValueObject')['controls']) {
                info[group.get('groupKeyObjectKeyValueTitle').value][item.get('groupKeyObjectKeyValueItemTitle').value] = {};
                for (const itemLvl2 of item.get('groupKeyObjectKeyValueItemObject')['controls']) {
                  info[group.get('groupKeyObjectKeyValueTitle').value][item.get('groupKeyObjectKeyValueItemTitle').value][itemLvl2.get('groupKeyObjectKeyValueItemKey').value] = itemLvl2.get('groupKeyObjectKeyValueItemValue').value;
                }
              }
            }
          }
        }

        asset['content']['data'].push(info);

      } else if (eventObjectType === 'ambrosus.asset.identifier') {

        const identifiers = {};
        identifiers['type'] = eventObjectType;
        identifiers['identifiers'] = {};

        for (const section of eventObject.get('data')['controls']) {
          for (const item of section.get('identifiers')['controls']) {
            identifiers['identifiers'][item.get('identifierType').value] = [];
            identifiers['identifiers'][item.get('identifierType').value].push(item.get('identifierValue').value);
          }
        }

        asset['content']['data'].push(identifiers);

      } else {

      }
    }

    const json = JSON.stringify(asset, null, 2);

    /* return json; */
    this.json = json;
  }
}
