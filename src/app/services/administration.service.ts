import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  usersSelected: string[] = [];
  toggleSelect: Subject<any> = new Subject();
  previewAppUrl = 'https://amb.to';
  companyLogo = '/assets/raster/logotip.jpg';

  constructor() { }

  // users selection service
  selectUser(userId: string) {
    this.usersSelected.push(userId);
  }

  unselectUser(userId: string) {
    const index = this.usersSelected.indexOf(userId);
    if (index > -1) {
      this.usersSelected.splice(index, 1);
    }
  }

  unselectUsers() {
    this.usersSelected = [];
  }

  getSelectedUsers() {
    return Array.from(new Set(this.usersSelected));
  }
}
