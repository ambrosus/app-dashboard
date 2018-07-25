import { Directive, ElementRef, HostListener, Renderer2, Input } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { AdministrationService } from 'app/services/administration.service';

@Directive({
  selector: '[appOnchecked]'
})
export class OncheckedDirective {

  @Input() toSelect;

  constructor(private el: ElementRef, private renderer: Renderer2,
    private assets: AssetsService, private administration: AdministrationService) {
    this.assets.toggleSelect.subscribe(resp => {
      this.checkboxClicked();
    });
    this.administration.toggleSelect.subscribe(resp => {
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
          case 'administration':
            this.administration.selectUser(this.el.nativeElement.name);
            break;
          default:
            this.assets.selectAsset(this.el.nativeElement.name);
            break;
        }
      }
    } else {
      this.renderer.removeClass(secondParent, 'checkbox--checked');
      if (secondParent.classList.contains('table__item')) {
        switch (this.toSelect) {
          case 'administration':
            this.administration.unselectUser(this.el.nativeElement.name);
            break;
          default:
            this.assets.unselectAsset(this.el.nativeElement.name);
            break;
        }
      }
    }
  }
}
