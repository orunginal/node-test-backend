var express = require('express'),
    _       = require('lodash'),
    config  = require('./config'),
    jwt     = require('jsonwebtoken');

var app = module.exports = express.Router();




// XXX: This should be a database of users :).
var users = [{
  id: 1,
  username: 'test@test.com',
  password: 'password'
}];

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 60*60*5 });
}

function getUserScheme(req) {
  
  var username;
  var type;
  var userSearch = {};
  //var test = JSON.parse(req.query);
  var str = '{ "name": "John Doe", "age": 42 }';
  var obj = JSON.parse(str);
  console.log(req.query);
  console.log(req.query.callback);
  console.log(req.query.user);

  // The POST contains a username and not an email
  if(req.query.user.email) {
    username = req.query.user.email;
    type = 'username';
    userSearch = { username: username };
  }

  return {
    username: username,
    type: type,
    userSearch: userSearch
  }
}


app.post('/users', function(req, res) {

  var userScheme = getUserScheme(req);  

  if (!userScheme.username || !req.body.user.password) {
    return res.status(400).jsonp("You must send the username and the password");
  }

  if (_.find(users, userScheme.userSearch)) {
   return res.status(400).jsonp("A user with that username already exists");
  }

  var profile = _.pick(req.body, userScheme.type, 'password', 'extra');
  profile.id = _.max(users, 'id').id + 1;

  users.push(profile);

  res.status(201).jsonp({
    token: createToken(profile)
  });
});

app.get('/sessions/create', function(req, res) {

  var userScheme = getUserScheme(req);

  if (!userScheme.username || !req.query.user.password) {
    return res.status(400).jsonp("You must send the username and the password");
  }

  var user = _.find(users, userScheme.userSearch);
  
  if (!user) {
    return res.status(401).jsonp("The username or password don't match");
  }

  if (user.password !== req.query.user.password) {
    return res.status(401).jsonp("The username or password don't match");
  }

  res.status(201).jsonp({
    token: createToken(user)
  });
});
