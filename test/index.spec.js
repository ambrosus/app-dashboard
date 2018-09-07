const chai = require('chai');
const chaiHttp = require('chai-http');
const server = 'http://localhost:5000';

chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should()

describe('Given an instance of UserController', () => {

    describe('GET /api/user/settings/:email', () => {
      it('Should get the user settings ', (done) => {
        chai.request(server)
          .get('/api/users/settings/meet.dave@outlook.com')
          .end((err, response) => {
            if (!err) {
              response.body.should.be.a('object');
              done();
            }
          })
      });
    });

    describe('GET /api/users/settings/:email', () => {
      it('Should get the user settings ', (done) => {
        chai.request(server)
          .get('/api/users/meet.dave@outlook.com')
          .end((err, response) => {
            if (!err) {
              response.body.should.be.a('object');
              done();
            }
          })
      });
    });

});