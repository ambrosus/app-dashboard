import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click', ['$event'])
  onDocumentClick(e) {
    const dropdownParent = this.el.nativeElement.querySelector('.dropdown');
    if (!dropdownParent) {
      return null;
    }
    if (dropdownParent.contains(e.target)) {
      // inside the dropdown
    } else {
      // outside the dropdown
      if (dropdownParent.classList.contains('active')) {
        this.renderer.removeClass(dropdownParent, 'active');
      }
    }
  }

  ngOnInit() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }
}
