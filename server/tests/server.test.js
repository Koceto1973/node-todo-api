const expect = require('expect');
const supertest = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

// SIGN UP
describe('POST /users', () => {

  it('correct sign up check', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';
    var currentDeviceId = 'jskf4u4f4uku4hu44u44k4hq22qq2'

    supertest(app)
      .post('/users')
      .send({email, password, currentDeviceId})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body.note).toBe({"note":`User ${email} signed up successfully!`}.note);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        // check the result in db
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        });
      });
  });

  it('email consistency check', (done) => {
    supertest(app)
      .post('/users')
      .send({
        email: 'and',
        password: 'gfkfidd123',
        currentDeviceId: 'fkfdli53i2i25tj'
      })
      .expect(400)
      .end(done);
  });

  it('password consistency check', (done) => {
    supertest(app)
      .post('/users')
      .send({
        email: 'example@example.com',
        password: '123',
        currentDeviceId: 'fkfdli53i2i25tj'
      })
      .expect(400)
      .end(done);
  });

  it('email duplication check', (done) => {
    supertest(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!',
        currentDeviceId: 'fkfdli53i2i25tj'
      })
      .expect(400)
      .end(done);
  });

});

// LOG IN
describe('POST /users/login', () => {

  it('should login user from same device and return auth token', (done) => {
    supertest(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
        currentDeviceId: users[1].currentDeviceId
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should login user from different device and return auth token', (done) => {
    supertest(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
        currentDeviceId: 'emufjv89jr784j20237fhn58rfk48fj4'
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    supertest(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

});

// Authentification
describe('GET /users/me/token', () => {
  it('should return 200 / user if authenticated', (done) => {
    supertest(app)
      .get('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      // .expect((res) => {  // disabled for security
      //   expect(res.body._id).toBe(users[0]._id.toHexString());
      //   expect(res.body.email).toBe(users[0].email);
      // })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    supertest(app)
      .get('/users/me/token')
      .expect(401)
      .expect((res) => {
        expect(res.body).not.toEqual({});
      })
      .end(done);
  });
});

// LOG OUT
describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    supertest(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
        .then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        })
        .catch((e) => done(e));
      });
  });
});

// LOG OUT all
describe('DELETE /users/me/tokens', () => {
  it('should remove all auth tokens on logout', (done) => {
    supertest(app)
      .delete('/users/me/tokens')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
        .then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        })
        .catch((e) => done(e));
      });
  });
});

// SIGN OFF
describe('DELETE /users/me', () => {
  it('should remove user', (done) => {
    supertest(app)
      .delete('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
        .then((user) => {
          expect(user).not.toBeTruthy;
          done();
        })
        .catch((e) => done(e));
      });
  });
});

// POST note
describe('POST /todos', () => {

  it('should create a new todo', (done) => {
    var text = 'Test todo text';
    // send the text to db
    supertest(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.note).toBe("New note created!");
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // check if the text is in db
        Todo.find({text})
        .then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    // send crap to db
    supertest(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => { 
        if (err) {
          return done(err);
        }
        // make sure nothing got in db
        Todo.find()
        .then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });

});

// GET all notes per user
describe('GET /todos', () => {
  it('should get all notes', (done) => {
    supertest(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.notes.length).toBe(1);
      })
      .end(done);
  });

  it('should not get notes if token is faulty', (done) => {
    supertest(app)
      .get('/todos')
      .set('x-auth', "123456789")
      .expect(400)
      .expect((res) => {
        expect(res.body.note).toBe(`Notes fetching failure!`);
      })
      .end(done);
  });
});

// GET note
describe('GET /todos/:id', () => {
  it('should return note', (done) => {
    supertest(app)
      .get(`/todos/${todos[0]._id.toHexString()}`) // ObjectId conversion to string
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return note created by other user', (done) => {
    supertest(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    supertest(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    supertest(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

// EDIT note
describe('PATCH /todos/:id', () => {
  it('should update the note', (done) => {
    var hexId = todos[0]._id.toHexString(); 
    var text = 'This should be the new text';

    supertest(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.note).toBe("Note editing success!");
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

      Todo.findById(todos[0]._id)
      .then((todo)=>{
         
        expect(todo.text).toBe(text);
        expect(todo.completed).toBe(true);
        expect(typeof todo.completedAt).toBe('number');
        done();
      })
      .catch((e)=>{
        done(e);
      });
    });
  });

  it('should not update the note if id is invalid', (done) => {
    var hexId = todos[0]._id.toHexString()+'123';
    var text = 'This should be the new text';

    supertest(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should not update the note if user token is invalid', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = 'This should be the new text';

    supertest(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token+'123')
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should not update the note with no text', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = '   ';

    supertest(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should not update the note created by other user or if id is not registered', (done) => {
    var hexId = todos[0]._id.toHexString();
    // var hexId = new ObjectID().toHexString();
    var text = 'This should be the new text';

    supertest(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it('should not update completed note', (done) => {
    var hexId = todos[1]._id.toHexString();
    var text = 'This should be the new text!!';

    supertest(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(404)
      .end(done);
  });
});

// DELETE note
describe('DELETE /todos/:id', () => {

  it('should remove a note', (done) => {
    var hexId = todos[1]._id.toHexString();

    supertest(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.note).toBe(`Note deleting success!`);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not remove a note of another user', (done) => {
    var hexId = todos[0]._id.toHexString();

    supertest(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if note is not found', (done) => {
    var hexId = new ObjectID().toHexString();

    supertest(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    supertest(app)
      .delete('/todos/123abc')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if user token is invalid', (done) => {
    var hexId = todos[1]._id.toHexString();

    supertest(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token+'123')
      .expect(404)
      .end(done);
  });

});

// DELETE all notes per user





