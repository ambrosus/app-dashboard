import { Component, OnInit, ViewEncapsulation, ElementRef, Renderer2, Input } from '@angular/core';

@Component({
  selector: 'app-asset-add',
  templateUrl: './asset-add.component.html',
  styleUrls: ['./asset-add.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetAddComponent implements OnInit {
  json;

  @Input() prefill;
  @Input() assetIds: String[];
  @Input() isDialog;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() { }

  tabOpen(open, element) {
    this.json = open === 'form' ? false : true;
    const tabHeaderItems = this.el.nativeElement.querySelectorAll('.tab_header_item');
    for (const item of tabHeaderItems) {
      this.renderer.removeClass(item, 'active');
    }
    this.renderer.addClass(element, 'active');
  }
}
