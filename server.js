// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var box2d = require("./box2d")();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


console.log(box2D.b2Vec2);

var world = new box2d.b2World( new Box2D.b2Vec2(0.0, -10.0) );