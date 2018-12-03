import { Injectable, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material';

@Injectable({
  providedIn: 'root',
})
export class MessageService implements OnInit {
  snackBarRef: MatSnackBarRef<any>;

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.snackBarRef.afterDismissed().subscribe(info => {
      if (info.dismissedByAction === true) {
        console.log('[SNACK] dissmised');
        this.dismissAll();
      }
    });
  }

  error(_error: any, reason = '', overrideError = false) {
    let message = '';
    const e = _error || {};
    const error = e.error || e;
    if (overrideError) {
      message = reason;
    } else if (error.meta && error.meta.message) {
      message = error.meta.message;
    } else if (error.meta && error.meta.error_message) {
      message = error.meta.error_message;
    } else if (error.reason) {
      message = error.reason;
    } else if (error.message) {
      message = error.message;
    } else if (reason) {
      message = reason;
    } else {
      message = 'Error occured. Try again.';
    }

    this.snackBarRef = this.snackBar.open(message, 'Dismiss', {
      panelClass: 'snack',
    });
  }

  success(resultMessage, o = null, overrideObject = false) {
    let message = '';
    const object = o || {};

    if (overrideObject || resultMessage) {
      message = resultMessage;
    } else if (object.meta && object.meta.message) {
      message = object.meta.message;
    } else {
      message = 'Success';
    }

    this.snackBarRef = this.snackBar.open(message, 'Close', {
      panelClass: 'snack',
    });
  }

  dismissAll() {
    this.snackBar.dismiss();
  }
}
