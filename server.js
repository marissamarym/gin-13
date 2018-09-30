// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var Box2D= require("./box2d");

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

var world = new Box2D.Dynamics.b2World(
	new b2Vec2(0, 10) //gravity
	, true //allow sleep
	);

