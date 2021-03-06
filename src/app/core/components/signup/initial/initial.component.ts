import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationsService } from 'app/services/organizations.service';

@Component({
  selector: 'app-initial',
  templateUrl: './initial.component.html',
  styleUrls: ['./initial.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InitialComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private organizationsService: OrganizationsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subs[this.subs.length] = this.route.queryParams.subscribe(
      ({ inviteId }) => {
        if (inviteId) {
          this.verifyInvite(inviteId);
        }
      },
    );
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  async verifyInvite(inviteId): Promise<any> {
    try {
      const invite = await this.organizationsService.verifyInvite(inviteId);
      this.authService.inviteId = inviteId;
      console.log('[GET] Invite verified: ', invite);
    } catch (error) {
      this.authService.inviteId = '';
      this.router.navigate(['/login']);
    }
  }
}
