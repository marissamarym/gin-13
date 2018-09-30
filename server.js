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

var world = {players:[], objects:[]}
var connections = []

var box2dworld = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);

function createBox(x, y, width, height){
	var bodyDef = new Box2D.Dynamics.b2BodyDef;
	bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	bodyDef.position.x = x;
	bodyDef.position.y = y;

	var fixDef = new Box2D.Dynamics.b2FixtureDef;
 	fixDef.density = 1.5;
 	fixDef.friction = 0.01;
 	fixDef.restitution = 1;
  
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(width, height);
	return box2dworld.CreateBody(bodyDef).CreateFixture(fixDef);  
}

function init(){
  
}


function update(){
  
}



