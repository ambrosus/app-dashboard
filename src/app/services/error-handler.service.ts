import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {

  constructor() { }

  handleError(error) {
    Sentry.captureException(error.originalError || error);
    console.log(error);
  }
}
