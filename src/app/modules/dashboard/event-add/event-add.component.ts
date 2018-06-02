import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {AbstractControl, Form, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from 'app/services/auth.service';
import {AssetsService} from 'app/services/assets.service';
import {Router} from '@angular/router';

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
  urlPattern = '/https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)/g';

  constructor(private auth: AuthService,
              private assets: AssetsService,
              private router: Router) {
    this.initForm();
  }

  ngOnInit() {
    console.log(this.assets.getSelectedAssets());
  }

  ngOnDestroy() {
    // Clean selected assets on page leave
    this.assets.unselectAssets();
  }

  private initForm() {
    this.eventForm = new FormGroup({
      'assetType': new FormControl(null, [Validators.required]),
      'name': new FormControl(null, [Validators.required]),
      'description': new FormControl(null, []),
      'productImage': new FormArray([
        new FormControl(null, [Validators.pattern(this.urlPattern)])
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
    (<FormArray>this.eventForm.get('productImage')).push(
      new FormControl(null, [Validators.pattern(this.urlPattern)])
    );
  }
  onRemoveImageUrl(index: number) {
    (<FormArray>this.eventForm.get('productImage')).removeAt(index);
  }

  // Identifiers
  onAddIdentifier() {
    (<FormArray>this.eventForm.get('identifiers')).push(
      new FormGroup({
        'identifier': new FormControl(null, []),
        'identifierValue': new FormControl(null, [])
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
        'customDataKey': new FormControl(null, []),
        'customDataValue': new FormControl(null, [])
      })
    );
  }
  onRemoveCustomKeyValue(index: number) {
    (<FormArray>this.eventForm.get('customData')).removeAt(index);
  }

  // Custom data groups (group name: key-value)
  onAddCustomGroup() {
    const customDataGroups = this.eventForm.get('customDataGroups') as FormArray;
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
    (<FormArray>this.eventForm.get('customDataGroups')).removeAt(index);
  }

  // Custom group data key-value pairs
  onAddCustomGroupKeyValue(i) {
    const groupsArray = this.eventForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).push(
      new FormGroup({
        'groupItemKey': new FormControl(null, []),
        'groupItemValue': new FormControl(null, [])
      })
    );
  }
  onRemoveCustomGroupKeyValue(i, j) {
    const groupsArray = this.eventForm.get('customDataGroups') as FormArray;
    (<FormArray>groupsArray.at(i).get('groupValue')).removeAt(j);
  }

  onSave() {
    // If no assets are selected,return to /assets page
    const selectedAssets = this.assets.getSelectedAssets();
    if (selectedAssets.length === 0) {
      alert(`You haven\'t selected any assets to add event to. Please do so on ${location.hostname}/assets.`);
      this.router.navigate(['/assets']);
      return;
    }

    console.log(this.eventForm.valid);
    console.log(this.eventForm.errors);

    if (!this.eventForm.valid) {
      this.error = true;
      console.log(this.eventForm.errors);
    }

    if (this.eventForm.valid) {
      this.error = false;

      console.log(this.eventForm.value);
      console.log(JSON.stringify(this.eventForm.value));
    }

    // const i1 = this.eventForm.get('input1').value;
    // const i2 = this.eventForm.get('input2').value;
    // const i3 = this.eventForm.get('input3').value;
    // const i4 = this.eventForm.get('input4').value;
    //
    // if (!this.eventForm.valid) {
    //   this.error = true;
    // } else {
    //   this.error = false;
    // }
    //
    // if (!this.error) {
    //   this.spinner = true;
    //   // Get the token
    //   console.log(i1, i2, i3, i4);
    //   setTimeout(() => {
    //     this.spinner = false;
    //     this.eventForm.reset();
    //     this.auth.cleanForm.next(true);
    //   }, 2000);
    // }
  }
}
