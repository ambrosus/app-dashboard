import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InviteService } from 'app/services/invite.service';
import { UsersService } from 'app/services/users.service';

declare let Web3: any;

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InviteComponent implements OnInit {
  createAccountForm: FormGroup;
  error;
  spinner = false;
  web3;
  success;
  token;
  address;
  secret;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private inviteService: InviteService,
    private usersService: UsersService
    ) {
    this.initCreateAccountForm();
    this.web3 = new Web3();
  }

  initCreateAccountForm() {
    this.createAccountForm = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      passwordConfirm: new FormControl('', [Validators.required]),
      address: new FormControl('', []),
      secret: new FormControl('', []),
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.token = params.token;

      this.inviteService.validateInvite(this.token).subscribe(
        (resp: any) => this.storage.set('user', resp),
        error => { console.log('Invite verify error: ', error); this.router.navigate(['/login']); }
      );
    });
  }

  createAccount() {
    this.error = null;
    this.success = null;

    const body: any = {
      hermes: this.storage.get('user')['company']['hermes'],
      user: this.createAccountForm.value,
    };

    if (!body.user.address || !body.user.secret) {
      const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
      body.user['address'] = address;
      body.user['secret'] = privateKey;
    }

    this.secret = body.user.secret;

    if (this.createAccountForm.valid) {
      if (!(body.user.password === body.user.passwordConfirm)) { return this.error = 'Passwords do not match'; }
      this.spinner = true;

      body.user['token'] = JSON.stringify(this.web3.eth.accounts.encrypt(body.user.secret, body.user.password));
      delete body.user.secret;

      this.usersService.createUser(body, this.token).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.address = body.user.address;
          this.success = true;
          console.log('Setup success: ', resp);
        },
        err => {
          this.spinner = false;
          this.error = err.message;
          console.log('Create account error: ', err);
        }
      );
    } else {
      this.error = 'All fields are required';
    }
  }
}
