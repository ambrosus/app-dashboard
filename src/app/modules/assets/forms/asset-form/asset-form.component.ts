import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { DomSanitizer } from '@angular/platform-browser';
import { autocomplete } from 'app/constant';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmComponent } from 'app/shared/components/confirm/confirm.component';
import { ProgressComponent } from 'app/shared/components/progress/progress.component';
import isUrl from 'is-url';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetFormComponent implements OnInit {
  forms: {
    asset?: FormGroup
  } = {};
  autocomplete: any[] = autocomplete;
  sequenceNumber = 0;
  promise: any = {};
  hasPermission = true;
  bundleSize: number | string = 0;
  tooLargeBundleSize = false;
  propertyIsValid = true;
  dialogs: {
    progress?: MatDialogRef<any>,
    confirm?: MatDialogRef<any>,
  } = {};
  asset: any;
  infoEvent: any;

  @Input() assetId: string;
  @Input() prefill: any;

  isObject(value) {
    return typeof value === 'object';
  }

  constructor(
    private storageService: StorageService,
    public assetsService: AssetsService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  sanitizeData(data) {
    return this.sanitizer.bypassSecurityTrustUrl(data);
  }

  ngOnInit() {
    const account: any = this.storageService.get('account') || {};
    this.hasPermission = account.permissions && Array.isArray(account.permissions) && account.permissions.indexOf('create_asset') > -1;

    this.assetId = this.assetId || this.data && this.data.assetId;
    this.prefill = this.prefill || this.data && this.data.prefill;

    this.initForm();
    this.calculateBundle();

    if (this.prefill) {
      this.prefillForm();
    }
  }

  private prefillForm() {
    const form = this.forms.asset;
    const info = this.prefill.info || {};

    form.get('assetType').setValue(info.assetType);
    form.get('name').setValue(info.name);
    form.get('description').setValue(info.description);
    if (info.images) {
      Object.keys(info.images).map(key => {
        this.addImage(null, { value: info.images[key].url });
      });
    }
    if (this.prefill.identifiers) {
      this.remove('identifiers', 0);
      Object.keys(this.prefill.identifiers.identifiers).map(key => {
        this.addIdentifier(key, this.prefill.identifiers.identifiers[key][0]);
      });
    }
    if (Array.isArray(info.properties) && info.properties.length) {
      this.remove('properties', 0);
      info.properties.map(property => {
        this.addProperty(property.key, property.value);
      });
    }
    if (Array.isArray(info.groups) && info.groups.length) {
      info.groups.map(group => {
        const groupProperties = [];

        Object.keys(group.value).map(key => {
          groupProperties.push(
            new FormGroup({
              name: new FormControl(key, []),
              value: new FormControl(group.value[key], []),
            }),
          );
        });

        (<FormArray>this.forms.asset.get('groups')).push(
          new FormGroup({
            title: new FormControl(group.key, []),
            content: new FormArray(groupProperties),
          }),
        );
      });
    }

    try {
      form.get('accessLevel').setValue(this.prefill.content.idData.accessLevel || 0);
    } catch (error) {
      console.error('Info event prefill: ', error);
    }
  }

  private initForm() {
    this.forms.asset = new FormGroup({
      assetType: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null, []),
      accessLevel: new FormControl(0, []),
      images: new FormArray([]),
      raws: new FormArray([]),
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

  progress() {
    this.dialog.closeAll();

    this.dialogs.progress = this.dialog.open(ProgressComponent, {
      panelClass: 'progress',
      hasBackdrop: false,
    });

    this.dialogs.progress.afterClosed().subscribe(result => {
      console.log('Progress asset form closed', result);
    });
  }

  confirm(question: string, buttons = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dialogs.confirm = this.dialog.open(ConfirmComponent, {
        panelClass: 'confirm',
        data: {
          question,
          buttons,
        },
      });

      this.dialogs.confirm.afterClosed().subscribe(result => {
        resolve(result);
      });
    });
  }

  // Methods for adding/removing new fields to the form

  remove(array, index: number) {
    (<FormArray>this.forms.asset.get(array)).removeAt(index);
    this.calculateBundle();
  }

  calculateBundle() {
    const event = this.generateInfoEvent(this.assetId, true);
    const bundle = JSON.stringify(event);
    const size = (encodeURI(bundle).split(/%..|./).length + 200000) / 1000000;

    this.bundleSize = Number.isInteger(size) ? size : size.toFixed(5);

    if (this.bundleSize >= 16) {
      this.tooLargeBundleSize = true;
      document.querySelector('.maxBundle').classList.add('maxBundleError');
      document.querySelector('#download').classList.add('displayedDownload');

      [].forEach.call(document.querySelectorAll('.addMedia'),
        button => button.classList.remove('activeAddMedia'));

      [].forEach.call(document.querySelectorAll('.urlInput'),
        input => input.disabled = true);
    } else {
      this.tooLargeBundleSize = false;
      document.querySelector('.maxBundle').classList.remove('maxBundleError');
      document.querySelector('#download').classList.remove('displayedDownload');
      [].forEach.call(document.querySelectorAll('.urlInput'),
        input => input.disabled = false);
    }
  }

  checkBundleSize(event) {
    if (this.tooLargeBundleSize) {
      event.preventDefault();
    }
  }

  addUrl(event, id, type) {
    const { target, target: { value } } = event;

    if (value) {
      if ((!isUrl(value) && !isUrl('http://' + value) && !/base64/.test(value)) || (type === 'image' && !/(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)/.test(value))) {
        target.classList.add('inputError');
        document.querySelector('#' + id).classList.remove('activeAddMedia');
        return;
      }
      document.querySelector('#' + id).classList.add('activeAddMedia');
    } else {
      document.querySelector('#' + id).classList.remove('activeAddMedia');
    }

    event.target.classList.remove('inputError');
  }

  addImage(event, input) {
    if (this.tooLargeBundleSize) {
      return;
    }

    const value = input.value;
    const form = this.forms.asset.value;
    let name = value.split('/');

    name = form.images.length ? name[name.length - 1] : 'default';

    if (name !== 'default') {
      name = name.split('.');
      name = name[0];
    }

    if (value) {
      (<FormArray>this.forms.asset.get('images')).push(
        new FormGroup({
          name: new FormControl(name, []),
          url: new FormControl(value, []),
        }),
      );
      input.value = '';
    }

    if (event) {
      event.target.classList.remove('activeAddMedia');
    }
    this.calculateBundle();
  }

  async addRawUrl(event, input) {
    if (this.tooLargeBundleSize) {
      return;
    }

    const value = input.value;

    if (value) {
      let name = value.split('/');
      name = name[name.length - 1];

      (<FormArray>this.forms.asset.get('raws')).push(
        new FormGroup({
          name: new FormControl(name, []),
          data: new FormControl(value, []),
          type: new FormControl('url', []),
        }),
      );
      input.value = '';
    }
    event.target.classList.remove('activeAddMedia');
    this.calculateBundle();
  }

  async addRawFile(event) {
    if (this.tooLargeBundleSize) {
      return;
    }

    const path = event.path || (event.composedPath && event.composedPath());

    const blob = path[0].files[0];

    const reader = new FileReader();
    await reader.readAsDataURL(blob);

    reader.onloadend = () => {
      if (!reader.result) {
        return;
      }

      const nameExpansion = blob.name.match(/\w[^.]*$/)[0];
      const type = blob.type.match(/^\w*/) ? blob.type.match(/^\w*/)[0] : nameExpansion === 'wbmp' ? 'image' : 'unknown';
      const expansion = blob.type.match(/\w[^/]*$/) ? blob.type.match(/\w[^/]*$/)[0] : nameExpansion;
      let background;

      switch (expansion) {
        case 'gif':
        case 'jpeg':
        case 'pjpeg':
        case 'png':
        case 'svg+xml':
        case 'vnd.microsoft.icon':
        case 'x-icon':
          background = reader.result;
          break;

        case 'tiff':
          if (!(/safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent) && !/firefox/i.test(navigator.userAgent))) {
            background = '/assets/svg/tiff.svg';
          } else {
            background = reader.result;
          }
          break;

        case 'webp':
          if (!(/safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent) && !/firefox/i.test(navigator.userAgent))) {
            background = reader.result;
          } else {
            background = '/assets/svg/webp.svg';
          }
          break;

        case 'vnd.wap.wbmp':
        case 'wbmp':
          background = '/assets/svg/wbmp.svg';
          break;

        default:
          background = '/assets/svg/document.svg';
      }

      (<FormArray>this.forms.asset.get('raws')).push(
        new FormGroup({
          name: new FormControl(blob.name, []),
          data: new FormControl(reader.result, []),
          expansion: new FormControl(expansion, []),
          nameExpansion: new FormControl(nameExpansion, []),
          type: new FormControl(type, []),
          background: new FormControl(background, []),
        }),
      );
      this.calculateBundle();
    };

    event.target.value = '';
  }

  addIdentifier(name = null, value = null) {
    (<FormArray>this.forms.asset.get('identifiers')).push(
      new FormGroup({
        name: new FormControl(name, []),
        value: new FormControl(value, []),
      }),
    );
  }

  checkPropertyName(event) {
    if (event.target.value === 'name' || event.target.value === 'description') {
      event.target.classList.add('inputError');
      document.querySelector('.propertyError').classList.remove('hidden');
      this.propertyIsValid = false;
    } else {
      event.target.classList.remove('inputError');
      document.querySelector('.propertyError').classList.add('hidden');
      this.propertyIsValid = true;
    }
  }

  addProperty(name = null, value = null) {
    (<FormArray>this.forms.asset.get('properties')).push(
      new FormGroup({
        name: new FormControl(name, []),
        value: new FormControl(value, []),
      }),
    );
  }

  addGroup() {
    (<FormArray>this.forms.asset.get('groups')).push(
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
    const groups = <FormArray>this.forms.asset.get('groups');
    (<FormArray>groups.at(i).get('content')).push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  removeGroupProperty(i, j) {
    const groups = <FormArray>this.forms.asset.get('groups');
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
      signature: this.assetsService.ambrosus.sign(idData, secret),
    };

    const asset = {
      assetId: this.assetsService.ambrosus.calculateHash(content),
      content,
    };

    this.assetId = asset.assetId;

    return asset;
  }

  private generateInfoEvent(_assetId = this.assetId, calculation = false) {
    const address = this.storageService.get('account')['address'];
    const secret = this.storageService.get('secret');
    const assetForm = this.forms.asset.getRawValue();

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
      images.forEach(image => {
        if (image.name && image.url) {
          _images[image.name] = {};
          _images[image.name]['url'] = image.url;
        }
      });

      if (Object.keys(_images).length) {
        info['images'] = _images;
      }
    }

    // Raws
    if (assetForm.raws.length > 0) {
      info['raws'] = assetForm.raws;
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
      dataHash: calculation ? '...' : this.assetsService.ambrosus.calculateHash(data),
    };

    const content = {
      idData,
      signature: calculation ? '...' : this.assetsService.ambrosus.sign(idData, secret),
      data,
    };

    const event = {
      eventId: calculation ? '...' : this.assetsService.ambrosus.calculateHash(content),
      content,
    };

    return event;
  }

  create() {
    this.promise['create'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.asset;

        if (this.assetsService.progress.status.inProgress) {
          throw new Error('Please wait until current upload completes');
        }

        if (form.invalid) {
          throw new Error('Please fill required fields');
        }

        const confirm = await this.confirm(`
  Are
  you
  sure
  you
  want
  to
  proceed ${this.prefill ? 'editing' : 'creating'}
  this
  asset?
`);
        console.log('Confirm ->', confirm);
        if (!confirm) {
          return reject();
        }

        if (!this.prefill) {
          this.asset = this.generateAsset();
        }
        this.infoEvent = this.generateInfoEvent(this.assetId);

        this.assetsService.responses.push({
          timestamp: Date.now(),
          assets: {
            success: [],
            error: [],
          },
          events: {
            success: [],
            error: [],
          },
        });

        // Start progress
        this.assetsService.progress.title = `${this.prefill ? 'Creating' : 'Editing'}
  asset
`;
        this.assetsService.progress.creating = this.prefill ? 1 : 2;
        this.assetsService.progress.for = 'assets';
        this.progress();
        this.assetsService.progress.status.start.next();

        if (!this.prefill) {
          const assetCreated = await this.assetsService.createAsset(this.asset);

          this.sequenceNumber += 1;
        }
        const eventsCreated = await this.assetsService.createEvents([this.infoEvent]);

        this.assetsService.progress.status.done.next();

        console.log('Asset form done: ', this.assetsService.responses);

        resolve();
      } catch (error) {
        this.assetsService.progress.status.done.next();

        console.error('[CREATE] Asset: ', error);
        reject();
      }
    });
  }
}
