import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private el: ElementRef, private renderer: Renderer2) {
    /* window.addEventListener('asset:created', function(e) {
      console.log('ASSET CREATED', e);
    });

    window.addEventListener('event:created', function(e) {
      console.log('EVENT CREATED', e);
    }); */
  }

  // Dropdown close on click outside of it
  @HostListener('click', ['$event'])
  onDocumentClick(e) {
    const dropdownParent = this.el.nativeElement.querySelectorAll('.dropdown');
    for (const element of dropdownParent) {
      if (element && !element.contains(e.target) && element.classList.contains('active')) {
        this.renderer.removeClass(element, 'active');
      }
    }
  }
}
