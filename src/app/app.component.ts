import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  navigationSub: Subscription;
  noWebWorker = false;

  constructor(private el: ElementRef, private renderer: Renderer2, private router: Router) {
    
    if (typeof(Worker) === 'undefined') {
      this.noWebWorker = true;
    }
    
    this.navigationSub = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });

 
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
