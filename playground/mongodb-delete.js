// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Eat lunch'})
  // .then((result) => {
  //   console.log(result.result); // { ok: 1 , n: countDeleted }
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Eat lunch'})
  // .then((result) => {
  //   console.log(result.result);  //  { ok: 1 , n: 1 } if any, takes only first
  // });

  // findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false})
  // .then((result) => {
  //   console.log(result.lastErrorObject); // { n: 1 } if any
  // });

  // db.collection('Users').deleteMany({name: 'Andrew'});

  db.collection('Users').findOneAndDelete({
    _id: new ObjectID("57ac8d47878a299e5dc21bc8")
  }).then((results) => {
    console.log(JSON.stringify(results, undefined, 2));
  });

  // db.close();
});
