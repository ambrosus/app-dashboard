import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { InviteService } from 'app/services/invite.service';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.scss'],
})
export class InvitesComponent implements OnInit, OnDestroy {
  selectAllText = 'Select all';
  invites;
  ids = [];
  invitesSubscription: Subscription;

  constructor(
    private storage: StorageService,
    private el: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService,
    private inviteService: InviteService
  ) { }

  ngOnInit() {
    this.getInvites();
  }

  getInvites() {
    // Get invites
    const user: any = this.storage.get('user') || {};

    this.invitesSubscription = this.inviteService.getInvites(user).subscribe(
      (resp: any) => { console.log('Invites GET: ', resp); this.invites = resp; },
      err => { if (err.status === 401) { this.authService.logout(); } console.log('Invites GET error: ', err); }
    );
  }

  ngOnDestroy() {
    if (this.invitesSubscription) { this.invitesSubscription.unsubscribe(); }
  }

  bulkActions(action) {
    switch (action.value) {
      case 'revoke':
        this.inviteService.revokeInvites(this.ids).subscribe(
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
    if (active) {
      this.toggleId('remove', item.id);
    } else {
      this.toggleId('add', item.id);
    }
  }
}
