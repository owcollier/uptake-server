'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app } = require('../index');
const { User } = require('../users');
const faker = require('faker');
const  jwt  = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
// const {dbConnect, dbDisconnect} = require('../db-knex');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

const tearDownDb = () => {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe('Mocha and Chai', function() {
  it('should be properly setup', function() {
    expect(true).to.be.true;
  });
});

//pass the header after the jwt creation

describe('User Authentication', function() {
  const testUser = {
    email: 'helloworld@gov.com',
    name: {
      firstName: 'TestUser',
      lastName: 'TestUser'
    },
    password: '12345'
  };
  
  before(function() {
    console.log('starting web server for authentication tests');
    dbConnect(TEST_DATABASE_URL);
    return User.hashPassword(testUser.password)
      .then(password => User.create({
        email: testUser.email,
        name: testUser.name,
        password
      }));
  });

  after(function() {
    console.log('Disconnecting server');
    return tearDownDb()
      .then(() => dbDisconnect());
  });

  it('registers the test user', () => {
    let newUser = {
      email: faker.internet.email(),
      name: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      password: faker.internet.password()
    };
    return chai.request.agent(app)
      .post('/api/users')
      .send(newUser)
      .then(res => {
        // console.log('registration res >>>>', res.body);
        expect(res).to.have.status(201);
        return User.findById(res.body.id)
          .then(user => {
            expect(user.email).to.equal(newUser.email);
          });
      });
  });

  it('logs the test user in', () => {
    return chai.request.agent(app)
      .post('/api/auth/login')
      .send({email: testUser.email, password: testUser.password})
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.authToken).to.be.a('string');
        expect(res).to.be.json;
      });
  });
});

