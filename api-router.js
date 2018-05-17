'use strict';

const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const JSONParser = bodyParser.json();

const config = require('./config');
const NewsAPI = require('newsapi');
//News API key
const newsapi = new NewsAPI('df99d64881394091ac31bd9919396478');

//get top headlines
router.get('/api/top20', (req, res) => {
  newsapi.v2.topHeadlines({
    language: 'en'
  })
    .then(headlines => {
      res.json(headlines);
    })
    .catch(err => {
      console.log(err);
    });
});

//get top headlines based on user search category
//business, entertainment, general, health, science, sports, technology
router.post('/api/catSearch', JSONParser, (req, res) => {
  const searchCategory = req.body.searchCategory;
  newsapi.v2.topHeadlines({
    category: searchCategory,
    language: 'en',
    country: 'us' 
  })
    .then(headlines => {
      res.json(headlines);
    })
    .catch(err => {
      console.log(err);
    });
});

// get top headlines based on user search and category
router.post('/api/qCatSearch', JSONParser, (req, res) => {
  const searchCategory = req.body.searchCategory;
  const searchTerm = req.body.searchTerm;
  newsapi.v2.topHeadlines({
    q: searchTerm,
    category: searchCategory,
    language: 'en',
    country: 'us' 
  })
    .then(headlines => {
      res.json(headlines);
    })
    .catch(err => {
      console.log(err);
    });
});

//get articles based on user search query
router.post('/api/qSearch', JSONParser, (req, res) => {
  const searchTerm = req.body.searchTerm;
  // console.log('searchTerm:', searchTerm);
  newsapi.v2.everything({
    q: searchTerm,
    sortBy: 'popularity',
    language: 'en'
    
  })
    .then(articles => {
      res.json(articles);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;