var {User} = require('./../models/user');

// valid token => attaches user and token to the request ( which user, from which device )
var authenticate = (req, res, next) => {
  var token = req.header('x-auth');  // alias for req.get(header)

  User.findByToken(token)
  .then((user) => {
    if (!user) {
      return Promise.reject("User not found!");
    }

    // modify req
    req.user = user;
    req.token = token;  // next callback has to know which token to remove
    // transfer control to next callback/middleware
    next();
  })
  .catch((e) => {
    return Promise.reject(e);
  });
};

module.exports = {authenticate};