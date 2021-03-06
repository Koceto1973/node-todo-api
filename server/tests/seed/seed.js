const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

// dummy users array for testing
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

currentDeviceId_1 = 'fjkkf444484r4r44r634234433443345';
currentDeviceId_2 = 'fkd4ht934r843fj89394faaw3ej39j39';


const users = [{
  _id: userOneId,
  email: 'andrew@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth', currentDeviceId: currentDeviceId_1 },process.env.JWT_SECRET).toString()
  }, {
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth', currentDeviceId:currentDeviceId_2 },process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  password: 'userTwoPass',
  currentDeviceId: 'fjkkf444485rt745589d7d4dd5d66ss3s4s6s74s6s4234433443345',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'},process.env.JWT_SECRET).toString()
  }]
}];

const populateUsers = (done) => {
  User.remove({})
  .then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])  // returned promise after all items are saved
  }).then(() => done());
};

// dummy todos array for testing
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
  }, {
    _id: new ObjectID(),
    text: 'Second test todo',
    _creator: userTwoId,
    completed: true,
    completedAt: 123456
}];

const populateTodos = (done) => {
  Todo.remove({})
  .then(() => {
    return Todo.insertMany(todos);
  })
  .then(() => done());
};


  
module.exports = {todos, populateTodos, users, populateUsers};