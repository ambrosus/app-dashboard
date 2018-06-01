import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';
import {SelectedAssetsService} from '../../services/selected-assets.service';

@Directive({
  selector: '[appOnchecked]'
})
export class OncheckedDirective {

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              private selectedAssets: SelectedAssetsService) {
    this.selectedAssets.toggleSelect.subscribe(
      resp => {
        const secondParent = this.el.nativeElement.parentNode.parentNode;
        const checkboxChecked = this.el.nativeElement.checked;

        console.log('subscribe change ', checkboxChecked);
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
    console.log('first change ', checkboxChecked);
    if (checkboxChecked) {
      this.renderer.addClass(secondParent, 'checkbox--checked');
    } else {
      this.renderer.removeClass(secondParent, 'checkbox--checked');
    }
  }

}
