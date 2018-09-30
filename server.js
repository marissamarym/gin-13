// server.js
// where your node app starts

///////
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')


//====================
// GLOBALS
//====================

var universe = {players:[], objects:[]}
var joints = []
var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 480;
var PIXELS_PER_METER = 100;
var GROUND_HEIGHT = 20;

var FPS = 30;
var serverTicks = 0;

//====================
// PHYSICS STUFF
//====================

var Box2D= require("./box2d");

var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 9.8));

function createBox(x, y, width, height, isStatic){
	var bodyDef = new Box2D.Dynamics.b2BodyDef;
	bodyDef.type = isStatic ? Box2D.Dynamics.b2Body.b2_staticBody : Box2D.Dynamics.b2Body.b2_dynamicBody;
	bodyDef.position.x = x / PIXELS_PER_METER;
	bodyDef.position.y = y / PIXELS_PER_METER;

	var fixDef = new Box2D.Dynamics.b2FixtureDef;
 	fixDef.density = 1.5;
 	fixDef.friction = 0.01;
 	fixDef.restitution = 0.8;
  
  fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
  fixDef.shape.SetAsBox(width / PIXELS_PER_METER / 2, height / PIXELS_PER_METER / 2);
	var body = world.CreateBody(bodyDef).CreateFixture(fixDef); 
  body.m_userdata = {name:"box",width:width,height:height,is_static:isStatic,id:Math.floor(Math.random()*10000)}
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
        universe.objects.push({name:name, x:x, y:y, width:w, height:h, rotation:r, 
                               id:f.m_userdata.id, is_static:f.m_userdata.is_static})
      }
    }
  }
}

function serverInit(){
  console.log('init');
  createBox(CANVAS_WIDTH/2,CANVAS_HEIGHT,CANVAS_WIDTH, GROUND_HEIGHT*2, true);
  createBox(-10,CANVAS_HEIGHT/2, 20, CANVAS_HEIGHT, true);
  createBox(CANVAS_WIDTH+10, CANVAS_HEIGHT/2, 20, CANVAS_HEIGHT, true);
  for (var i = 0; i < 5; i++){
    createBox(Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 40+i*10,40+i*10, false);
  }
  setInterval(serverUpdate,1000/FPS);
}


function serverUpdate(){
  serverTicks += 1;  
  calculatePlayers();
  interact();
  world.Step(1 / FPS, 10, 10);
  universe.objects = []
  describeBox2DWorld();
  
  
}

serverInit()

//====================
// PLAYING STUFF
//====================

var v3 = require('./ld-v3')

function getBodyById(id){
  for (var b = world.m_bodyList; b; b = b.m_next) {
    for (var f = b.m_fixtureList; f; f = f.m_next) {
      if (f.m_userdata && f.m_userdata.id == id) {
				return b
      }
    }
  }  
}
function getAnotherBody(body){
  for (var b = world.m_bodyList; b; b = b.m_next) {
    if (b != body){
      return b
    }
  }
}
function getPlayerById(id){
  for (var i = 0; i < universe.players.length; i++){
    if (universe.players[i].id == id){
      return universe.players[i];
    }
  }
}
function isJointed(id){
  for (var i = 0; i < joints.length; i++){
    if (joints[i].object_id == id || joints[i].player_id == id){
      return true;
    }
  }
  return false;
}

function calculatePlayers(){
  for (var i = 0; i < universe.players.length; i++){
    var pose0 = universe.players[i].raw_data.pose;
    if (pose0 == null){
      continue;
    }
    var scale = 150/v3.dist(pose0.nose, v3.lerp(pose0.leftHip, pose0.rightHip,0.5));
    var basePos = v3.lerp(pose0.leftAnkle, pose0.rightAnkle,0.5);

    var pose = {}
    for (var k in pose0){
      
      pose[k] = v3.add(v3.scale(v3.subtract(pose0[k],basePos),scale),{x:basePos.x, y:CANVAS_HEIGHT-GROUND_HEIGHT})
      
    }
    universe.players[i].pose = pose;
  } 
}

function interact(){
  for (var i = 0; i < universe.players.length; i++){
    var pose = universe.players[i].pose;
    if (pose == null){
      continue;
    }
    var p = pose.rightWrist;
    for (var b = world.m_bodyList; b; b = b.m_next) {
      for (var f = b.m_fixtureList; f; f = f.m_next) {
        if (f.m_userdata && !f.m_userdata.is_static) {
          var x = (f.m_body.m_xf.position.x * PIXELS_PER_METER);
          var y = (f.m_body.m_xf.position.y * PIXELS_PER_METER);
          if (v3.dist({x:x,y:y}, p) < f.m_userdata.width && !isJointed(f.m_userdata.id) && joints.length < 10){
            var targ = new Box2D.Common.Math.b2Vec2(p.x/PIXELS_PER_METER, p.y/PIXELS_PER_METER);
            b.SetPosition(new Box2D.Common.Math.b2Vec2(targ.x,targ.y))
            var def = new Box2D.Dynamics.Joints.b2MouseJointDef();
            def.bodyA = getAnotherBody(b);
            def.bodyB = b;
            def.target = targ;
            def.collideConnected = true;
            def.maxForce = 800 * b.GetMass();
            def.dampingRatio = 0;
            try{
              var joint = world.CreateJoint(def);
              universe.players[i].hand.push(f.m_userdata.id);
              joints.push({"player_id":universe.players[i].id, "object_id":f.m_userdata.id, joint:joint})
              break;
            }catch (e){
              console.log("joint creation failed.");
            }
          }
        }
      }
    }
  }  

  //console.log(joints);
  for (var j = joints.length-1; j >= 0; j--){

    var player = getPlayerById(joints[j].player_id);
    var p = player.pose.rightWrist;
    var joint = joints[j].joint;
    joint.SetTarget(new Box2D.Common.Math.b2Vec2(p.x/PIXELS_PER_METER, p.y/PIXELS_PER_METER));
    var reactionForce = joint.GetReactionForce(FPS);
    var forceModuleSq = reactionForce.LengthSquared();
    var maxForceSq = 120;
    if(forceModuleSq > maxForceSq){
      
      player.hand.splice(player.hand.indexOf(joints[j].object_id),1);
      joints.splice(j,1);
      try{
        world.DestroyJoint(joint);
      }catch(e){
        console.log("joint deletion failed.");
      }
      
    }
  }
}


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
		
		universe.players.push({id:socket.id, raw_data:{}, pose:null, hand:[]})
		setInterval(heartbeat, 10)

		function heartbeat(){
			io.sockets.emit('heartbeat', universe)
		}
	}
	function gameUpdate(data){

		for (var i = 0; i < universe.players.length; i++) {
			if(socket.id == universe.players[i].id){
				universe.players[i].raw_data = data;
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


//====================
// UTILS
//====================

function mapval(value,istart,istop,ostart,ostop){
    return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
}