const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {
  console.log(req.url);
  let body;
  try {
    body = fs.readFileSync(`./src${req.url}`)
  } catch (err) {
    body = fs.readFileSync('./src/index.html')
  }
  res.end(body);
});

server.listen(8080);
// server.listen(process.env.PORT || 4000)

console.log('server started');