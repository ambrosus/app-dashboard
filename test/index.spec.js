const chai = require('chai');
const chaiHttp = require('chai-http');
// const server = 'http://localhost:5000';
process.env['SECRET'] = 'random';
const server = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should()

describe('Given an instance of UserController', () => {

  describe('GET /api/users/:email', () => {
    it('Should get the user object', (done) => {
      chai.request(server)
        .get('/api/users/meet.dave@outlook.com')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          done();
        })
    });
  });

  describe('GET /api/user/settings/:email', () => {
    it('Should get the user settings based on email address', (done) => {
      chai.request(server)
        .get('/api/users/settings/meet.dave@outlook.com')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('string');
          done();
        })
    });
  });

});

describe('Given an instance of HermesesController', () => {

  describe('GET /api/hermeses', () => {
    it('Should get the hermeses array', (done) => {
      chai.request(server)
        .get('/api/hermeses')
        .end((err, response) => {
          response.body.should.have.property('resultCount');
          response.should.have.status(200);
          response.body.should.be.a('object');
          done();
        })
    });
  });

});
