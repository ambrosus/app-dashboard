import { StorageService } from 'app/services/storage.service';
import { Component, OnInit, ViewEncapsulation, ElementRef, Renderer2, Input } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-asset-add',
  templateUrl: './asset-add.component.html',
  styleUrls: ['./asset-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetAddComponent implements OnInit {
  json;

  @Input() prefill;
  @Input() assetId;
  @Input() isDialog;

  constructor(
    private assetService: AssetsService,
    private storage: StorageService,
    private el: ElementRef,
    private renderer: Renderer2,
    private dialogRef: MatDialog
  ) { }

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

  tabOpen(open, element) {
    this.json = open === 'form' ? false : true;
    const tabHeaderItems = this.el.nativeElement.querySelectorAll('.tab_header_item');
    for (const item of tabHeaderItems) {
      this.renderer.removeClass(item, 'active');
    }
    this.renderer.addClass(element, 'active');
  }
}
