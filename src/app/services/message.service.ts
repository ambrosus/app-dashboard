/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
