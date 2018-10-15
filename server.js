// server.js
// where your node app starts

//////////.
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')


//====================
// GLOBALS
//====================

var universe = []
var worlds = {}
var worlds_accessory = {}
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

function createBox(world, x, y, width, height, isStatic){
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
  body.m_userdata = {name:"box",width:width,height:height,is_static:isStatic,
                     id:Math.floor(Math.random()*10000),interact_cooldown:0}
  return body;
}
function describeBox2DWorld(world, dest){
  for (var b = world.m_bodyList; b; b = b.m_next) {
    for (var f = b.m_fixtureList; f; f = f.m_next) {
      if (f.m_userdata) {
				var x = (f.m_body.m_xf.position.x * PIXELS_PER_METER);
				var y = (f.m_body.m_xf.position.y * PIXELS_PER_METER);
        var r = f.m_body.m_sweep.a;
        var name = f.m_userdata.name;
        var w = f.m_userdata.width;
        var h = f.m_userdata.height;
        dest.push({name:name, x:x, y:y, width:w, height:h, rotation:r, 
                   id:f.m_userdata.id, is_static:f.m_userdata.is_static})
      }
    }
  }
}

function createFloorAndWall(world){
  createBox(world,-10,(CANVAS_HEIGHT-GROUND_HEIGHT)/2, 20, CANVAS_HEIGHT-GROUND_HEIGHT, true);
  createBox(world,CANVAS_WIDTH+10, (CANVAS_HEIGHT-GROUND_HEIGHT)/2, 20, CANVAS_HEIGHT-GROUND_HEIGHT, true);
  createBox(world,CANVAS_WIDTH/2,CANVAS_HEIGHT,CANVAS_WIDTH+20, GROUND_HEIGHT*2, true); 
}

function emptyRoomDesc(name){
  return {name:name,players:[],objects:[]}
}

var initRoom = {
  box_pickup:function(){var room_name = "box_pickup"
    
    universe.push(emptyRoomDesc(room_name))
    worlds[room_name] = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 9.8));
    worlds_accessory[room_name] = {"joints":[]}
    createFloorAndWall(worlds[room_name]);
    for (var i = 0; i < 4; i++){
      createBox(worlds[room_name],Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 55+i*5,55+i*5, false);
    }
  },
  custom_shape:function(){var room_name = "custom_shape"
  
    universe.push(emptyRoomDesc(room_name))
    worlds[room_name] = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 9.8));
    createFloorAndWall(worlds[room_name]);
  },
}


function serverInit(){
  console.log('init');
    
  for (var k in initRoom){
    initRoom[k]()
  }
  
  setInterval(serverUpdate,1000/FPS);
}


function serverUpdate(){
  serverTicks += 1;
  
  for (var i = 0; i < universe.length; i++){
    if (universe[i].players.length == 0){
      continue;
    }
    calculatePlayers(universe[i]);
    
    interact[universe[i].name]();
    worlds[universe[i].name].Step(1 / FPS, 10, 10);
    universe[i].objects = []
    describeBox2DWorld(worlds[universe[i].name], universe[i].objects);
  }
  
  
}

serverInit()

//====================
// PLAYING STUFF
//====================

var v3 = require('./ld-v3')

function getRoomByName(name){
  for (var i = 0; i < universe.length; i++){
    if (universe[i].name == name){
      return universe[i]
    }
  }
}

function getPlayerEnclosingRoomIndex(id){
  for (var i = 0; i < universe.length; i++){
    for (var j = 0; j < universe[i].players.length; j++){
      if (universe[i].players[j].id == id){
        return i;
      }
    }
  }
}

function getBodyById(world,id){
  for (var b = world.m_bodyList; b; b = b.m_next) {
    for (var f = b.m_fixtureList; f; f = f.m_next) {
      if (f.m_userdata && f.m_userdata.id == id) {
				return b
      }
    }
  }  
}
function getAnotherBody(world,body){
  for (var b = world.m_bodyList; b; b = b.m_next) {
    if (b != body){
      return b
    }
  }
}
function getPlayerById(room, id){
  for (var i = 0; i < room.players.length; i++){
    if (room.players[i].id == id){
      return room.players[i];
    }
  }
}
function isJointed(joints, id){
  for (var i = 0; i < joints.length; i++){
    if (joints[i].object_id == id || joints[i].player_id == id){
      return true;
    }
  }
  return false;
}


function calculatePlayers(room){
  for (var i = 0; i < room.players.length; i++){
    var pose0 = room.players[i].raw_data.pose;
    if (pose0 == null){
      continue;
    }
    room.players[i].pose = pose0;
  } 
}

function cooldown(world){
  for (var b = world.m_bodyList; b; b = b.m_next) {
      for (var f = b.m_fixtureList; f; f = f.m_next) {
        if (f.m_userdata && f.m_userdata.interact_cooldown > 0) {
          f.m_userdata.interact_cooldown -= 1;
        }
      }
  }
}
var interact = {
box_pickup:function(){
  var world = worlds["box_pickup"]
  var room  = getRoomByName("box_pickup")
  var joints = worlds_accessory["box_pickup"]["joints"]
  cooldown(world);
  
  for (var i = 0; i < room.players.length; i++){
    var pose = room.players[i].pose;

    if (pose == null){
      continue;
    }
    var p = pose.rightWrist;
    
    for (var b = world.m_bodyList; b; b = b.m_next) {
      for (var f = b.m_fixtureList; f; f = f.m_next) {
        if (f.m_userdata && !f.m_userdata.is_static) {
          var x = (f.m_body.m_xf.position.x * PIXELS_PER_METER);
          var y = (f.m_body.m_xf.position.y * PIXELS_PER_METER);
          if (v3.dist({x:x,y:y}, p) < f.m_userdata.width * 1.2
              && !isJointed(joints, f.m_userdata.id) 
              && joints.length < 10
              && f.m_userdata.interact_cooldown <= 0
              && room.players[i].hand.length < 1
              ){
            
            var targ = new Box2D.Common.Math.b2Vec2(p.x/PIXELS_PER_METER, p.y/PIXELS_PER_METER);
            b.SetPosition(new Box2D.Common.Math.b2Vec2(
              targ.x+f.m_userdata.width/PIXELS_PER_METER/2,
              targ.y+f.m_userdata.height/PIXELS_PER_METER/2))
            var def = new Box2D.Dynamics.Joints.b2MouseJointDef();
            def.bodyA = getAnotherBody(world,b);
            def.bodyB = b;
            def.target = targ;
            def.collideConnected = true;
            def.maxForce = 1000 * b.GetMass();
            def.dampingRatio = 0;
            try{
              var joint = world.CreateJoint(def);
              room.players[i].hand.push(f.m_userdata.id);
              joints.push({"player_id":room.players[i].id, "object_id":f.m_userdata.id, joint:joint})
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

    var player = getPlayerById(room, joints[j].player_id);
    var obj = getBodyById(world, joints[j].object_id);
    if (player == undefined || obj == undefined){
      try{
        world.DestroyJoint(joints[j].joint);
      }catch(e){
        console.log("joint deletion failed.");
      }
      joints.splice(j,1);
      continue;
    }
    for (var f = obj.m_fixtureList; f; f = f.m_next) {
        if (f.m_userdata) {
          f.m_userdata.interact_cooldown = 100;
        }
    }
    var p = player.pose.rightWrist;
    var joint = joints[j].joint;
    joint.SetTarget(new Box2D.Common.Math.b2Vec2(p.x/PIXELS_PER_METER, p.y/PIXELS_PER_METER));
    var reactionForce = joint.GetReactionForce(FPS);
    var forceModuleSq = reactionForce.LengthSquared();
    var maxForceSq = obj.GetMass()*20000;
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
},
custom_shape:function(){
  
  
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
		
		universe[0].players.push({id:socket.id, raw_data:{}, pose:null, hand:[]})
		setInterval(heartbeat, 50)

    var self_id = socket.id
    
		function heartbeat(){
      var room = universe[getPlayerEnclosingRoomIndex(self_id)]
			io.sockets.emit('heartbeat', room)
		}
	}
	function gameUpdate(data){

		for (var i = 0; i < universe.length; i++) {
      for (var j = 0; j < universe[i].players.length; j++){
        if(socket.id == universe[i].players[j].id){
          universe[i].players[j].raw_data = data;
          break;
        }
      }
		}
	}

	function removePlayer(){
    for (var i = 0; i < universe.length; i++) {
      for (var j = 0; j < universe[i].length; j++){
        if(socket.id == universe[i].players[j].id){
          universe[i].players.splice(j, 1)
          console.log('disconnected')
          break;
        }
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