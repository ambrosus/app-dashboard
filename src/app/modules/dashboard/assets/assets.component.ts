import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { AssetsService } from 'app/services/assets.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetsComponent implements OnInit {
  assets: any;
  noEvents = false;
  error = false;

  constructor(
    private assetsService: AssetsService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.assetsService.getAssets().subscribe(
      (resp: any) => {
        console.log(resp);
        this.assets = resp;
        if (resp.resultCount === 0) {
          this.noEvents = true;
        }
      },
      error => {
        console.log(error);
        this.error = true;
      }
    );
  }

  onSelectAll(e, input) {
    const assetsList = this.el.nativeElement.querySelector('.assets-list');
    if (input.checked) {
      for (const asset of assetsList.children) {
        const checkbox = asset.children[0].children[0];
        checkbox.checked = true;
        this.assetsService.selectAsset(checkbox.name);
      }
      this.assetsService.toggleSelect.next('true');
    } else {
      for (const asset of assetsList.children) {
        const checkbox = asset.children[0].children[0];
        checkbox.checked = false;
      }
      this.assetsService.unselectAssets();
      this.assetsService.toggleSelect.next('true');
    }
    console.log(this.assetsService.getSelectedAssets());
  }
}
