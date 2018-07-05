import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private value: string;
  public width = 1;
  public colors: any = [
    '#D9534F', '#DF6A4F', '#E5804F', '#EA974E', '#F0AD4E', '#D2AF51',
    '#B5B154', '#97B456', '#7AB659', '#5CB85C', '#5CB85C'];
  public color = '#D9534F';
  public message: String = 'You password must be at least 6 characters in length and contain the following:-';
  private symbool: object = {'isit': 'false'};
  private nucbool: object = {'isit': 'false'};
  private numbool: object = {'isit': 'false'};
  public passwordExists: Boolean = false;
  weakPassword = false;
  spinner = false;
  error = false;
  resetForm: FormGroup;
  passwordsNotMatch = false;

  strongPassword(control: FormControl): { [s: string]: boolean } {
    const hasNumber = /\d/.test(control.value);
    const hasUpper = /[A-Z]/.test(control.value);
    const hasLower = /[a-z]/.test(control.value);
    const valid = hasNumber && hasUpper && hasLower;
    if (!valid && control.value && control.value.length < 5) {
      return { strong: true };
    }
    return null;
  }

  constructor() {
    this.resetForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      oldPassword: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [this.strongPassword]),
      passwordConfirm: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
  }

  resetPass() {
    const email = this.resetForm.get('email').value;
    const password = this.resetForm.get('password').value;
    const oldPassword = this.resetForm.get('oldPassword').value;
    const passwordConfirm = this.resetForm.get('passwordConfirm').value;

    if (this.resetForm.get('password').hasError('strong')) {
      this.weakPassword = true;
      this.error = true;
      return;
    }

    if (password !== passwordConfirm) {
      this.passwordsNotMatch = true;
      this.error = true;
      return;
    }

    this.weakPassword = false;
    this.passwordsNotMatch = false;

    const body = {
      email: email,
      oldPassword: oldPassword,
      password: password
    };

    console.log(body);

  }

  checkPassword(event: any) {
    this.value = event.target.value;
    if (this.value.length >= 1) {
      this.passwordExists = true;
    } else {
      this.passwordExists = false;
    }
    // Additions :-D
    const noc = this.value.length; // Number of Characters
    const nuc = this.value.replace(/[^A-Z]/g, '').length; // Uppercase Letters
    const nlc = this.value.replace(/[^a-z]/g, '').length; // Lowercase Letters
    const num = this.value.replace(/[^0-9]/g, '').length; // Numbers
    let symr: number;
    const sym = this.value.match(/[ !@#$£%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g); // Symbols
    if (!sym) {
      symr = 0;
    } else {
      symr = sym.length;
    }

    // Deductions :-(
    let aucr: number; // Letters Only Resolver
    const auc = this.value === this.value.toUpperCase();
    if (auc === false) {
      aucr = noc;
    } else {
      aucr = 0;
    } // Letters Only
    let anvr: number; // Number Only Resolver
    const anv = +this.value;
    if (anv !== NaN || anv !== 0) {
      anvr = noc;
    } else {
      anvr = 0;
    } // Numbers Only
    let cons: number; // Repeat Characters Resolver
    if (this.value.match(/(.)\1\1/)) {
      cons = noc * noc;
    } else {
      cons = 0;
    } // Repeat Characters
    // The MF math
    const additions = ((noc * 4) + ((noc - nuc) * 2) + ((nlc - nuc) * 2) + (num * 4) + ((symr) * 6));
    const deductions = ((aucr) + (anvr) + cons);
    const total = additions - deductions;
    if (sym == null) {
      this.symbool['isit'] = false;
    } else {
      this.symbool['isit'] = true;
    }
    if (nuc === 0) {
      this.nucbool['isit'] = false;
    } else {
      this.nucbool['isit'] = true;
    }
    if (num === 0) {
      this.numbool['isit'] = false;
    } else {
      this.numbool['isit'] = true;
    }
    if (total < 101) {
      if (total < 0) {
        this.width = 1;
      } else {
        this.width = total;
      }
    } else {
      this.width = 100;
    }
    this.updateBar();
  }

  updateBar() {
    const i = Math.round(this.width / 10);
    this.color = this.colors[i];
  }

}
