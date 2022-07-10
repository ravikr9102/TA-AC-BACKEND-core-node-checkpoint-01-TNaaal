var fs = require('fs');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var path = require('path');

var server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let store = '';
  let parsedUrl = url.parse(req.url, true);

  req.on('data', (chunk) => {
    store += chunk;
  });

  console.log(req.url);
  req.on('end', () => {
    let contactPath = path.join(__dirname + '/contacts/');

    // Handling about route
    if (req.method === 'GET' && req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./index.html').pipe(res);
    }

    // Handling about route
    if (req.method === 'GET' && req.url === '/about') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./about.html').pipe(res);
    }

    // Handling contact route
    if (req.method === 'GET' && req.url === '/contact') {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream('./contact.html').pipe(res);
    }

    // Handling contact request if method is post
    if (req.method === 'POST' && req.url === '/contact') {
      let parsedData = qs.parse(store);
      let stringifiedData = JSON.stringify(parsedData);
      if (parsedData.username === '') {
        return res.end('username cannot be empty');
      }
      fs.open(contactPath + parsedData.username + '.json', 'wx', (err, fd) => {
        if (err) {
          res.setHeader('Content-Type', 'text/html');
          return res.end('<h1> username already exists </h1>');
        }
        fs.write(fd, stringifiedData, (err) => {
          fs.close(fd, (err) => {
            res.setHeader('Content-Type', 'text/html');
            res.write(`<h1> ${parsedData.username} contact saved`);
            res.end();
          });
        });
      });
    }

    // handle GET request on `/users?username=ANY_USERNAME_FROM_CONTACTS` which should
    if (req.method === 'GET' && parsedUrl.pathname === '/users') {
      if (parsedUrl.query.username) {
        console.log(
          'this is the username file that we need to be read ',
          parsedUrl.query.username
        );
        let userFile = path.join(
          contactPath + parsedUrl.query.username + '.json'
        );
        fs.readFile(userFile, 'utf-8', (err, content) => {
          res.setHeader('Content-Type', 'application/json');
          return res.end(content);
        });
      }
    }

    // Handling css request
    if (req.method === 'GET' && req.url.split('.').pop() === 'css') {
      let cssFile = req.url;
      res.setHeader('Content-Type', 'text/css');
      fs.readFile(__dirname + cssFile + 'utf-8', (err, content) => {
        res.end(content);
      });
    }

    // Handling image request
    if (req.method === 'GET' && req.url.split('.').pop() === 'jpg') {
      console.log(req.url.split('.').pop());
      let imgUrl = req.url;
      res.setHeader('Content-Type', 'image/jpg');
      fs.createReadStream(__dirname + req.url).pipe(res);
    }
  });
}

server.listen(4000, () => {
  console.log('server listening on port 4000');
});
