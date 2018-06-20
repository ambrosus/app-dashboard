import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  OnInit
} from '@angular/core';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private storage: StorageService
  ) {}

  @HostListener('click', ['$event'])
  onDocumentClick(e) {
    const dropdownParent = this.el.nativeElement.querySelectorAll('.dropdown');
    for (const element of dropdownParent) {
      if (!element) {
        return null;
      }
      if (element.contains(e.target)) {
        // inside the dropdown
      } else {
        // outside the dropdown
        if (element.classList.contains('active')) {
          this.renderer.removeClass(element, 'active');
        }
      }
    }
  }

  ngOnInit() {
    const hostname = window.location.hostname;
    if (
      !(
        hostname.startsWith('localhost') ||
        hostname.startsWith('ambrosus-app-dashboard')
      )
    ) {
      this.storage.environment = 'test';
    }
    if ('scrollRestoration' in history) {
      // Scroll restoration
      history.scrollRestoration = 'manual';
    }
  }
}
