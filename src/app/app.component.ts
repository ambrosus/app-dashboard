import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  noWebWorker = false;

  constructor(private el: ElementRef, private renderer: Renderer2, private storage: StorageService) {
    if (typeof(Worker) === 'undefined') {
      this.noWebWorker = true;
    }
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
