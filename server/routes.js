'use strict';
var path = require('path')
  , readabilityApi = require(path.join(__dirname, 'readability'))
  , storyController = require(path.join(__dirname, 'controllers', 'story.controller'))
  , hxnCrawler = require(path.join(__dirname, 'hxnCrawler'))
  , rdtCrawler = require(path.join(__dirname, 'rdtCrawler'))
  , User = require(path.join(__dirname, 'models', 'User.model')).User
  , devLog = require(path.join(__dirname, 'utils')).devLog

  // , auth = require(path.join(__dirname, 'auth'))
;

module.exports = function(app) {

  app.get('/readability/:url', readabilityApi);

  app.get('/api/:source/:limit/:minScore', storyController.getStories);

  app.get('/crawlers/forceHxnFetch', hxnCrawler.forceFetch);

  app.get('/crawlers/forceRdtFetch/:list/:limit', rdtCrawler.forceFetch);


  app.post('/api/reddit/vote', function(req, res) {
    if (!req.isAuthenticated()) { //TODO: make this middleware to share in all reddit routes (isAuthenticated + req.user.reddit.token)
      return res.json({err: 'not logged in'});
    }
    console.log('using token:', req.user.reddit.token);
    // var url = 'https://oauth.reddit.com/api/v1/vote';
    var url = 'https://oauth.reddit.com/api/vote';
    var dir = parseInt(req.body.dir);
    var id = req.body.id;
    var options = {
      url: url,
      form: {
        id: id,
        dir: dir
      },
      json: true,
      headers: {
        'User-Agent': 'news-bubbles.herokuapp.com/0.3.8 by /u/bubble_boi',
        'Authorization': 'bearer ' + req.user.reddit.token
      }
    };
    console.log('request to submit a request with object:', options);

    request.post(options, function(err, req, data) {
      console.log('got response from URL:', url);
      console.log('err:', err);
      console.log('data:', data);
      res.json(data);
    });
  });


  app.get('/api/reddit/info', function(req, res) {
    if (!req.isAuthenticated()) { //TODO: make this middleware to share in all reddit routes (isAuthenticated + req.user.reddit.token)
      return res.json({err: 'not logged in'});
    }
    console.log('using token:', req.user.reddit.token);
    console.log('got query:', req.query);
    var url = 'http://www.reddit.com/by_id/' + req.query.id + '.json';
    var options = {
      url: url,
      json: true,
      headers: {
        'User-Agent': 'news-bubbles.herokuapp.com/0.3.8 by /u/bubble_boi',
        'Authorization': 'bearer ' + req.user.reddit.token
      }
    };
    console.log('request to submit a request with object:', options);

    request.get(options, function(err, req, data) {
      console.log('got response from URL:', url);
      console.log('err:', err);
      console.log('data:', data);
      res.json(data);
    });
  });



  // app.post('/api/reddit/me', function(req, res) {
  //   if (!req.isAuthenticated()) { //TODO: make this middleware to share in all reddit routes (isAuthenticated + req.user.reddit.token)
  //     return res.json({err: 'not logged in'});
  //   }
  //   console.log('using token:', req.user.reddit.token);
  //   var url = 'https://oauth.reddit.com/api/v1/me.json';
  //   var options = {
  //     url: url,
  //     json: true,
  //     headers: {
  //       'User-Agent': 'news-bubbles.herokuapp.com/0.3.8 by /u/bubble_boi',
  //       'Authorization': 'bearer ' + req.user.reddit.token
  //     }
  //   };
  //   // res.json({success: 'yay'});
  //   console.log('request to submit a request with object:', options);

  //   request.get(options, function(err, req, data) {
  //     console.log('got response from URL:', url);
  //     console.log('err:', err);
  //     // console.log('req:', req);
  //     console.log('data:', data);
  //     res.json(data);
  //   });
  // });


};