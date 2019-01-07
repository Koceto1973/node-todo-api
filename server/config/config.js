var env = process.env.NODE_ENV || 'development'; 

let port = process.env.PORT || 3000;

if (env === 'development') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

// debug logouts:
console.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`env = ${env}`);
console.log(`process.env.PORT = ${process.env.PORT}`);
console.log(`process.env.MONGODB_URI = ${process.env.MONGODB_URI}`);

exports.port = port;