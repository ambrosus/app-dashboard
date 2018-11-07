import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  getAccountSub: Subscription;
  routeSub: Subscription;
  accountForm: FormGroup;
  account;

  constructor(
    private accountsService: AccountsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const address = params.address;
      this.accountsService.getAccount(address).subscribe();
      this.getAccount();
    });
  }

  ngOnDestroy() {
    if (this.getAccountSub) { this.getAccountSub.unsubscribe(); }
  }

  initAccountForm() {
    this.accountForm = new FormGroup({
      address: new FormControl({ value: this.account.address, disabled: true }),
      full_name: new FormControl({ value: this.account.fullName, disabled: true }),
      email: new FormControl({ value: this.account.email, disabled: true }),
      timeZone: new FormControl({ value: this.account.timeZone, disabled: true }),
    });
  }

  getAccount() {
    this.getAccountSub = this.accountsService._account.subscribe(
      account => {
        console.log('[GET] Account: ', account);
        this.account = account;
        this.initAccountForm();
      },
    );
  }

  save() {

  }
}
