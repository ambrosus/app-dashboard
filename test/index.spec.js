const chai = require('chai');
const AuthController = require('../server/controllers/auth');

const expect = chai.expect;

describe('Given an instance of AuthController', () => {
    describe('see if controller is initialised', () => {
      it('console.log the controller', () => {
        console.log(AuthController.getActiveSessions);
      });
    });
});