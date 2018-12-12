import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {

  constructor() { }

  handleError(error) {
    console.error(error);
  }
}
