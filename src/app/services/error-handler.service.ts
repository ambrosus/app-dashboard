import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {

  constructor() { }

  handleError(error) {
    if (environment.test || environment.prod) {
      Sentry.captureException(error.originalError || error);
    }
  }
}
