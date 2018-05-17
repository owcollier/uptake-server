'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true},    
  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  },
  password: { type: String },
  articlesShared: [{
    title: { type: String },
    url: { type: String},
    image: { type: String },
    author: { type: String },
    source: {
      id: { type: String },
      name: { type: String }
    },
    dateShared: { type: Date, default: Date.now }
  }],
  collections: [{
    collectionTitle: { type: String },
    dateCreated: { type: Date, default: Date.now },
    collectionArticles: [{
      source: {
        id: { type: String },
        name: { type: String }
      },
      title: { type: String },
      author: { type: String },
      description: { type: String },
      image: { type: String},
      url: { type: String },
      dateAdded: { type: Date, default: Date.now }
    }]
  }]
});

UserSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.name.firstName || '',
    lastName: this.name.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};
  
UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };