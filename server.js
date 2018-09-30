// server.js
// where your node app starts
var express = require('express'); 

var app = express();
var server = app.listen(process.env.PORT || 300);

app.use(express.static('public'));
console.log('server running')

var socket = require('socket.io');
var io = socket(server);


var Box2D= require("./box2d");
var socket = require('socket.io');


var universe = {players:[], objects:[]}
var connections = []

var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);

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
	return world.CreateBody(bodyDef).CreateFixture(fixDef);  
}

function serverInit(){
  
}


function severUpdate(){
  
}

serverInit




//====================
// SOCKETING STUFF
//====================


function newConnection(socket){
	console.log('new connection: ' + socket.id)
	socket.on('game-start', gameStart)
	socket.on('game-update', gameUpdate)
	socket.on('disconnect', removePlayer)

	function gameStart(data){
		console.log(socket.id)
		
		universe.players.push({"id":socket.id, "data":{}})
		setInterval(heartbeat, 10)

		function heartbeat(){
			io.sockets.emit('heartbeat', universe)
		}
	}
	function gameUpdate(data){

		for (var i = 0; i < universe.players.length; i++) {
			if(socket.id == universe.players[i].id){
				universe.players[i].data = data;
				break;
			}
		}
	}

	function removePlayer(){
		for (var i = 0; i < universe.players.length; i++) {
			if(socket.id == universe.players[i].id){
				universe.players.splice(i, 1)
				console.log('disconnected')
				break;
			}
		}
	}
}	

io.sockets.on('connection', newConnection);