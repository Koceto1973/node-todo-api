var env = process.env.NODE_ENV || 'development'; // production takes precedence if any

if (env === 'development' || env === 'test') {  // see package json
  var config = require('./config.json');
  var envConfig = config[env];
  
  // array of keys
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

// JWT_SECRET for production is config:set in advance to heroku

