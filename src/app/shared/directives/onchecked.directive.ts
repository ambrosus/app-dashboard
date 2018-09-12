import { Directive, ElementRef, HostListener, Renderer2, Input } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';

@Directive({
  selector: '[appOnchecked]'
})
export class OncheckedDirective {

  @Input() toSelect;

  constructor(private el: ElementRef, private renderer: Renderer2, private assets: AssetsService) {
    window.addEventListener('on:checked', () => {
      this.checkboxClicked();
    });
  }

  @HostListener('change')
  onChange() {
    this.checkboxClicked();
  }

  checkboxClicked() {
    const secondParent = this.el.nativeElement.parentNode.parentNode.parentNode;
    const checkboxChecked = this.el.nativeElement.checked;
    if (checkboxChecked) {
      this.renderer.addClass(secondParent, 'checkbox--checked');
      if (secondParent.classList.contains('table__item')) {
        switch (this.toSelect) {
          default:
            this.assets.selectAsset(this.el.nativeElement.name);
            break;
        }
      }
    } else {
      this.renderer.removeClass(secondParent, 'checkbox--checked');
      if (secondParent.classList.contains('table__item')) {
        switch (this.toSelect) {
          default:
            this.assets.unselectAsset(this.el.nativeElement.name);
            break;
        }
      }
    }
  }
}
