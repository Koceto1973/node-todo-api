// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('57bc4b15b3b6a3801d8c47a2')  // find document
  }, {
    $set: {
      completed: true                              // use operator on it
    }
  }, {
    returnOriginal: false                          // options, this returns updated document promise
  })
  .then((result) => {
    console.log(result);
  });

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('57abbcf4fd13a094e481cf2c')
  }, {
    $set: {   // use operator on it
      name: 'Andrew'
    },
    $inc: {  // use operator on it
      age: 1
    }
  }, {
    returnOriginal: false
  }).then((result) => {
    console.log(result);
  });

  // db.close();
});
