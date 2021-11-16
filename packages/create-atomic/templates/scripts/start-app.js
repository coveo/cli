const {config} = require('dotenv');
const handler = require('serve-handler');
const http = require('http');

config();
const server = http.createServer((request, response) => {
  return handler(request, response, {public: 'public'});
});

server.listen(process.env.PORT, () => {
  console.log(`Application running at http://localhost:${process.env.PORT}`);
});
