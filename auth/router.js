'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, FACEBOOK_APP_TOKEN } = require('../config');
const router = express.Router();
const { User } = require('../users');

router.use(bodyParser.json());

const createAuthToken = function(user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.email,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});

router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.apiRepr());
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

router.post('/facebook', (req, res) => {
  let user;
  const userToken = req.body.token;
  console.log('user token from client side >>>>', userToken);
  fetch(`https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${FACEBOOK_APP_TOKEN}`)
    .then(response => response.json())
    .then(data => {
      const { user_id } = data.data;
      fetch(`https://graph.facebook.com/${user_id}?access_token=${FACEBOOK_APP_TOKEN}&fields=id,first_name,last_name,email`)
        .then(response => response.json())
        .then(userData => {
          User.findOne({$or: [{'email': userData.email}, {'facebook.id': user_id}]})
            .then(_user => {
              user = _user;
              console.log('user after facebook query >>>', user);
              if (!user) {
                const { first_name, last_name, email } = userData;
                let name = {
                  firstName: first_name,
                  lastName: last_name
                };
                return User.create({
                  name,
                  email,
                  'facebook.id': user_id,
                  'facebook.token': userToken
                })
                  .then(user => {
                    console.log('Newly created user >>>>>', user);
                    const authToken = createAuthToken(user.apiRepr());
                    console.log('Our auth token after creating user>>>>>', authToken);
                    return res.status(201).location(`/api/auth/${user.id}`).json({authToken});
                  });
              }
              else if (user) {
                console.log('Else if user already exists >>>>>', user);
                user.facebook.id = user_id;
                user.facebook.token = userToken;
                !user.email ? user.email = userData.email : null;
                console.log('existing user after assigning keys >>>>', user);
                user.save();   
                const authToken = createAuthToken(user.apiRepr());
                console.log('our auth token after existing user verified', authToken);
                return res.json({authToken});    
              }
            }).catch(err => {
              res.status(err.code).json({message:'Uh oh, something went wrong'});
            });
        });
    });
});

module.exports = { router };