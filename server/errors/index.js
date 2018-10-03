/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
class AmbrosusError extends Error {
  constructor(message, data) {
    super(message);
    this.name = this.constructor.name;
    this.data = data || null;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AmbrosusError {
  constructor(message, data) {
    super(`Invalid data: ${message}`, data);
  }
}

class AuthenticationError extends AmbrosusError {
  constructor(message, data) {
    super(`Authentication failed: ${message}`, data);
  }
}

class PermissionError extends AmbrosusError {
  constructor(message, data) {
    super(`Permission denied: ${message}`, data);
  }
}

class NotFoundError extends AmbrosusError {
  constructor(message, data) {
    super(`Not found: ${message}`, data);
  }
}

module.exports = {
  AmbrosusError,
  ValidationError,
  AuthenticationError,
  PermissionError,
  NotFoundError
};
