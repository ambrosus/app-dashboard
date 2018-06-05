import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
    /* if (this.assets.getSelectedAssets().length === 0) {
      alert(`You didn\'t select any assets. Please do so on ${location.hostname}/assets`);
      this.router.navigate(['/assets']);
    } */
  }

  ngOnDestroy() {
    this.assets.unselectAssets();
  }

  private initForm() {

  }

  onSave() {

  }

}
