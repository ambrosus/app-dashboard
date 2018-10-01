import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.scss']
})
export class InvitesComponent implements OnInit, OnDestroy {
  selectAllText = 'Select all';
  invites;
  ids = [];
  invitesSubscription: Subscription;

  constructor(private storageService: StorageService, private http: HttpClient, private el: ElementRef, private renderer: Renderer2, private authService: AuthService) { }

  ngOnInit() {
    this.getInvites();
  }

  getInvites() {
    // Get invites
    const user: any = this.storageService.get('user') || {};
    const url = `/api/invites/company/${user.company._id}`;

    this.invitesSubscription = this.http.get(url).subscribe(
      (resp: any) => {
        console.log('Invites GET: ', resp);
        this.invites = resp.data;
      },
      err => {
        if (err.status === 401) { this.authService.logout(); }
        console.log('Invites GET error: ', err);
      }
    );
  }

  ngOnDestroy() {
    if (this.invitesSubscription) { this.invitesSubscription.unsubscribe(); }
  }

  bulkActions(action) {
    switch (action.value) {
      case 'revoke':
        const url = `/api/invites/delete`;

        this.http.post(url, { ids: this.ids }).subscribe(
          (resp: any) => {
            console.log('Invites DELETE: ', resp);
            this.getInvites();
          },
          err => {
            if (err.status === 401) { this.authService.logout(); }
            console.log('Invites DELETE error: ', err);
          }
        );
        break;
    }

    action.value = 'default';
  }

  toggleId(action, id) {
    const index = this.ids.indexOf(id);
    switch (action) {
      case 'add':
        if (index === -1) { this.ids.push(id); }
        break;
      default:
        if (index > -1) { this.ids.splice(index, 1); }
    }
  }

  onSelectAll(e, input) {
    let table = this.el.nativeElement.querySelectorAll('.table__item.table');
    table = Array.from(table);
    if (input.checked) {
      this.selectAllText = 'Unselect all';
      table.map((item) => {
        this.renderer.addClass(item, 'checkbox--checked');
        this.toggleId('add', item.id);
      });
    } else {
      this.selectAllText = 'Select all';
      table.map((item) => {
        this.renderer.removeClass(item, 'checkbox--checked');
        this.toggleId('remove', item.id);
      });
    }
  }

  onSelect(e, item) {
    const active = item.classList.contains('checkbox--checked');
    const action = active ? 'removeClass' : 'addClass';
    this.renderer[action](item, 'checkbox--checked');
    if (active) { this.toggleId('remove', item.id); } else { this.toggleId('add', item.id); }
  }
}
