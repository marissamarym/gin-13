// server.js
// where your node app starts


var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')


//====================
// GLOBALS
//====================

var universe = {players:[], objects:[]}
var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 480;
var PIXELS_PER_METER = 100;
var FPS = 30;


//====================
// PHYSICS STUFF
//====================

var Box2D= require("./box2d");

var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);

function createBox(x, y, width, height, isStatic){
	var bodyDef = new Box2D.Dynamics.b2BodyDef;
	bodyDef.type = isStatic ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;
	bodyDef.position.x = x / PIXELS_PER_METER;
	bodyDef.position.y = y / PIXELS_PER_METER;

	var fixDef = new Box2D.Dynamics.b2FixtureDef;
 	fixDef.density = 1.5;
 	fixDef.friction = 0.01;
 	fixDef.restitution = 1;
  
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(width / PIXELS_PER_METER, height / PIXELS_PER_METER);
	var body = world.CreateBody(bodyDef).CreateFixture(fixDef); 
  body.m_userdata = {name:"box",width:width,height:height}
  return body;
}
function describeBox2DWorld(){
  for (var b = world.m_bodyList; b; b = b.m_next) {
    for (var f = b.m_fixtureList; f; f = f.m_next) {
      if (f.m_userdata) {
				var x = (f.m_body.m_xf.position.x * PIXELS_PER_METER);
				var y = (f.m_body.m_xf.position.y * PIXELS_PER_METER);
        var r = f.m_body.m_sweep.a;
        var name = f.m_userdata.name;
        var w = f.m_userdata.width;
        var h = f.m_userdata.height;
        world.objects.push({name:name, x:x, y:y, width:w, height:h, rotation:r})
      }
    }
  }
}

function serverInit(){
  console.log('init');
  createBox(0,CANVAS_HEIGHT-10,CANVAS_WIDTH,10, true);
  for (var i = 0; i < 10; i++){
    createBox(Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 20,20, false);
  }
  setInterval(serverUpdate,1000/FPS);
}


function serverUpdate(){
  world.Step(1 / FPS, 10, 10);
  world.objects = []
  describeBox2DWorld();
}

serverInit()


//====================
// SOCKETING STUFF
//====================

var socket = require('socket.io');
var io = socket(server);


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