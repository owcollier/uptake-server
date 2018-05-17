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
  const authToken = createAuthToken(req.user.apiRepr());
  res.json({authToken});
});

// router.post('/facebook', (req, res) => {
//   let user;
//   const userToken = req.body.token;
//   fetch(`https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${FACEBOOK_APP_TOKEN}`)
//     .then(response => response.json())
//     .then(data => {
//       const { user_id } = data.data;
//       fetch(`https://graph.facebook.com/${user_id}?access_token=${FACEBOOK_APP_TOKEN}&fields=id,email,first_name,last_name`)
//         .then(response => response.json())
//         .then(userData => {
//           if(!userData.email) {
//             //if no email, use the user's facebook id and hash it for required email field
//             User.hashPassword(userData.id)
//               .then(hashedId => {
//                 return userData = {
//                   email: hashedId+'@FACEBOOK.COM',
//                   first_name: userData.first_name,
//                   last_name: userData.last_name
//                 };
//               });
//           }          
//           User.findOne({$or: [{'email': userData.email}, {'facebook.id': user_id}]})
//             .then(_user => {
//               user = _user;
//               if (!user) {
//                 const { first_name, last_name, email } = userData;
//                 let name = {
//                   firstName: first_name,
//                   lastName: last_name
//                 };
//                 return User.create({
//                   name,
//                   email,
//                   'facebook.id': user_id,
//                   'facebook.token': userToken
//                 })
//                   .then(user => {
//                     const authToken = createAuthToken(user.apiRepr());
//                     return res.status(201).location(`/api/auth/${user.id}`).json({authToken});
//                   });
//               }
//               else if (user) {
//                 user.facebook.id = user_id;
//                 user.facebook.token = userToken;
//                 !user.email ? user.email = userData.email : null;
//                 user.save();   
//                 const authToken = createAuthToken(user.apiRepr());
//                 return res.json({authToken});    
//               }
//             }).catch(() => {
//               res.status(500).json({message:'Uh oh, something went wrong'});
//             });
//         });
//     });
// });


// router.post('/google', (req, res) => {
//   let user;
//   const userToken = req.body.token;
//   fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${userToken}`)
//     .then(response => response.json())
//     .then(data => {
//       const { sub, email, given_name, family_name } = data;
//       User.findOne({ $or: [{'email': email}, {'google.id': sub}] })
//         .then(_user => {
//           user = _user;
//           if(!user){
//             let name = {
//               firstName: data.given_name,
//               lastName: data.family_name
//             };
//             return User.create({
//               name,
//               email,
//               'google.id': sub,
//               'google.token': userToken
//             })
//               .then(user => {
//                 const authToken = createAuthToken(user.apiRepr());
//                 return res.status(201).location(`/api/auth/${user.id}`.json({authToken}));
//               });
//           }
//           if(user){
//             user.email ? user.google.id = sub : user.email = user.email;
//             user.google.token = userToken;
//           }
//           return user.save();
//         })
//         .then(user => {
//           const authToken = createAuthToken(user.apiRepr());
//           return res.json({authToken}); 
//         });
//     });
// });

module.exports = { router };