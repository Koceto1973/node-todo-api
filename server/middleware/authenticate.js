var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');  // alias for req.get(header)

  User.findByToken(token)
  .then((user) => {
    if (!user) {
      return Promise.reject();
    }

    // modify req
    req.user = user;
    req.token = token;
    // transfer control to next callback/middleware
    next();
  })
  .catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};