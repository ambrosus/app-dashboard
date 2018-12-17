import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  request = {
    start: new Subject(),
    done: new Subject(),
    error: new Subject(),
    success: new Subject(),
  };

  constructor() { }
}
