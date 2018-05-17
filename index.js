'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const apiRouter = require('./api-router');

const app = express();

const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: collectionsRouter } = require('./collections');
const { router: activityRouter } = require('./activity');
const { router: usersRouter } = require('./users');
const jwtAuth = passport.authenticate('jwt', { session: false });



app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/activities', activityRouter);

app.get('/api/dashboard', jwtAuth, (req, res) => {		
  return res.json({data: 'hooray!'});
});

app.use('/', apiRouter);

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = {app};
