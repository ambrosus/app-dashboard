import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';
import {AssetsService} from 'app/services/assets.service';

@Directive({
  selector: '[appOnchecked]'
})
export class OncheckedDirective {

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              private assets: AssetsService) {
    this.assets.toggleSelect.subscribe(
      resp => {
        const secondParent = this.el.nativeElement.parentNode.parentNode;
        const checkboxChecked = this.el.nativeElement.checked;
        if (checkboxChecked) {
          this.renderer.addClass(secondParent, 'checkbox--checked');
        } else {
          this.renderer.removeClass(secondParent, 'checkbox--checked');
        }
      }
    );
  }

  @HostListener('change') onChange() {
    const secondParent = this.el.nativeElement.parentNode.parentNode;
    const checkboxChecked = this.el.nativeElement.checked;
    if (checkboxChecked) {
      this.renderer.addClass(secondParent, 'checkbox--checked');
      if (secondParent.classList.contains('assets-list__item')) {
        this.assets.selectAsset(this.el.nativeElement.name);
      }
    } else {
      this.renderer.removeClass(secondParent, 'checkbox--checked');
      if (secondParent.classList.contains('assets-list__item')) {
        this.assets.unselectAsset(this.el.nativeElement.name);
      }
    }
    console.log(this.assets.getSelectedAssets());
  }

}
