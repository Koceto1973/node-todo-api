const http = require('http');

http.createServer((request, response) => {
  // responding on POST request with /echo routing
      
  if (request.method === 'POST' && request.url === '/echo') {
    
  }

}).listen(3000);