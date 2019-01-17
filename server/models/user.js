const mongoose = require('mongoose');

const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// email
// password
// array of tokens ( access, token ) for access from different devices
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    unique: true, // built into the schema check for uniqueness
    validate: {   // built into the schema email validation
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{ // array of access tokens from different devices
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// user db document => js object with _id and email
UserSchema.methods.toJSON = function () {
  var user = this; // reference to the instance document
  var userObject = user.toObject(); // converting db document to js object

  return _.pick(userObject, ['_id', 'email']);  // lodash method to filter object
}; // document instance method

// user db document => updates user with the generated token and returns the token
UserSchema.methods.generateAuthToken = function (currentDeviceId) {
  var user = this;
  var access = 'auth';
  // salting _id to get token
  var token = jwt.sign({_id: user._id.toHexString(), currentDeviceId, access},process.env.JWT_SECRET).toString();

  // if the token is once issued, just return it
  var isTokenNew = true;
  for (var i = 0; i < user.tokens.length; i++) {
    if (jwt.verify(user.tokens[i].token, process.env.JWT_SECRET).currentDeviceId === currentDeviceId) {
      isTokenNew = false;
      token = user.tokens[i].token;
    }    
  }

  if (isTokenNew) {
    user.tokens = user.tokens.concat([{access, token}]); // adding the new token to the array
  };

  // saves the updated with the token user
  return user.save() 
  .then(() => { return token; })
  .catch(err => { console.log('User save not successfull after token generation:' + err); }); 
}; // document instance method

// user db document, token => updates user removing the token specified
UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: { // remove item ftom array, matching criteria https://docs.mongodb.com/manual/reference/operator/update/pull/
      tokens: {token}
    }
  })
  .catch ((e)=>{
    return Promise.reject(e);
  });
}; // document instance method

// new model method, token => user
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    // unsalting token to get _id
    decoded = jwt.verify(token,process.env.JWT_SECRET);
  } catch(e) {
    return Promise.reject('Token decoding failure!');    
  }

  return User.findOne({'_id': decoded._id })
  .catch((e)=>{
    return Promise.reject('Data base search by _id failure!');  
  });
}; // model method

// new model method
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this; // reference to the model

  return User.findOne({email})
  .then((user) => {
    if (!user) { return Promise.reject('unknown email'); }  // returns rejected promise

    // if (user)
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject('unknown password');
        }
      });
    });

  });

}; 

// pre middleware runs before saving users, if user password is changed, rebuild salted hash
UserSchema.pre('save', function (next) {
  var user = this;

  // if user password is changed, rebuild salted hash prior saving user
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// final document model creation and export
var User = mongoose.model('User', UserSchema);
module.exports = {User}