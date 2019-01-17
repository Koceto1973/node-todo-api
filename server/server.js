// checked package.json
require('./config/config');
// checked config.json

var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());  // middleware for body parsing

// SIGN UP ( initial LOG IN from first device )
// requires valid email property in req.body, otherwise client is informed 
// requires unique email property in req.body, otherwise client is informed 
// requires valid password property in req.body, min 6 characters, otherwise client is informed
// requires currentDeviceId property in req.body
// if all required is ok, client is signed up and receives a login token for that particular device
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'currentDeviceId']);
  var user = new User(body); // email validator and unique checks run here
  
  user
  .save()
  .then(() => {
    return user.generateAuthToken(body.currentDeviceId);
  })
  .then((token) => {
    res.header('x-auth', token).send({"note":`User ${user.email} signed up successfully!`}); // custom header
  })
  .catch((e) => { 
    // console.log(JSON.stringify(e,null,2)); 

    if (e.message.includes('E11000')) {
      res.status(400).send({"note":"Email duplication is not allowed!"});
    } else {
      res.status(400).send({"note":e.message});
    }
  })  
});

// LOG IN ( on unused device, or after logout on a used device )
// requires registered email property in req.body, otherwise client is informed 
// requires corresponding password property in req.body, otherwise client is informed
// if all required is ok, client is informed and receives a login token
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'currentDeviceId']);

  User.findByCredentials(body.email, body.password)
  .then((user) => {  // user is found, resolve case
    return user.generateAuthToken(body.currentDeviceId) // should return promise to use .then() after
    .then((token) => {
      res.header('x-auth', token).send({"note":`User ${user.email} logged in successfully!`}); // send token back, as log in credential at different device
    });
  })
  .catch((e) => {  // no user/pass match found, reject case
    console.log(JSON.stringify(e,null,2)); 
    res.status(400).send({"note":`Email/password mismatch!`});
  });
});

// LOG OUT
// remove requested token from the user who owns that token 
app.delete('/users/me/token', authenticate, (req, res) => {

  req.user.removeToken(req.token)
  .then(() => { // resolve
    res.status(200).send({"note":`User log out success!`});
  })
  .catch((e)=>{ // reject
    console.log(JSON.stringify(e,null,2)); 
    res.status(400).send({"note":`User log out failure!`});
  });
});

// SIGN OFF with email, password

// ??????
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// POST todo
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });

});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});



app.listen(process.env.PORT, () => {
  console.log(`Started at port ${process.env.PORT}`);
});

module.exports = {app};