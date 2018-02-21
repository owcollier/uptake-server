'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../../users/models');
const { JWT_SECRET } = require('../config');

const LocalStrategy = new LocalStrategy((username, password, callbackfn) => {
    let user;
    User.findOne({username: username})
        .then(resUser => {
            user = resUser;
            if(!user){
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                })
            }
            return user.validatePassword(password)
        })
        .then(isValid => {
            if(!isValid){
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                })
            }
            return callbackfn(null, user);
        })
        .catch(error => {
            if(error.reason === 'LoginError'){
                return callbackfn(null, false, error)
            }
            return callbackfn(error, false)
        })
})

const JwtStrategy = new JwtStrategy(
    {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        algorithms: ['HS256']
    },
    (result, done) => {
        done(null, result.user);
    }
)

module.exports = { LocalStrategy, JwtStrategy }