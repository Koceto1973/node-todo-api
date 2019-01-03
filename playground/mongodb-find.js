const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {  // TodoApp database
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server.');

  // const cursorObject = db.collection('Todos').find(); // pointer-object to db, lots of methods - toArray, count ...see driverAPI, cursor object properties
  // console.log(cursorObject.toArray());                // returns promise

  // fetching particular collection
  // db.collection('Users').find().toArray()  
  // .then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  // query in particular collection
  // db.collection('Users').find({
  //   location: 'Vancoover'
  // }).toArray()
  // .then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  // query in particular collection by id needs ObjectId
  // db.collection('Users').find({
  //   _id: new ObjectID('5c2e8186cb7e6e83287e6a57')
  // }).toArray()
  // .then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  // counting collection documents
  // db.collection('Users').find().count().then((count) => {
  //   console.log(`Todos count: ${count}`);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  db.collection('Users').find({name: 'Andrew'}).toArray()
  .then((docs) => {
    console.log(JSON.stringify(docs, undefined, 2));
  });

  console.log('Finished interacting with MongoDB server.');
  db.close();
});
