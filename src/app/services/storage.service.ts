import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  namespace = 'amb_';

  constructor() {}

  // localStorage wrapper
  set(key, value) {
    localStorage.setItem(`${this.namespace}${key}`, value);
  }

  put(key, value) {
    if (!this.get(key)) {
      localStorage.setItem(`${this.namespace}${key}`, value);
    } else {
      return false;
    }
  }

  get(key): string {
    return localStorage.getItem(`${this.namespace}${key}`);
  }

  delete(key) {
    localStorage.removeItem(`${this.namespace}${key}`);
  }

  clear() {
    localStorage.clear();
  }
}
