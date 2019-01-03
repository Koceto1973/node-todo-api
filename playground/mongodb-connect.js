const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {  // TodoApp database
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server.');

  // Insert new doc into Users (name, age, location)
  db.collection('Users').insertOne({         // Users collection gets amended with document
    name: 'Peter',
    age: 35,
    location: 'NewYork'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user', err);
    }

    console.log(result.ops);
  });

  console.log('Finished interacting with MongoDB server.');
  db.close();
});
