// server.js
// where your node app starts

/////////////.////
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')

var io = require('socket.io')(server);

var rooms = {"lobby":newRoom("lobby")};

function newRoom(name){
  return {name:name, messages:[],players:{}};
}

function locatePlayer(id){
  for (var k in rooms){
    if (id in rooms[k].players){
      return k;
    }
  }
}

function updateServerData(data){
  var room = rooms[locatePlayer(data.id)];
  if (room == undefined){
    console.log("err: player id belongs to no room: "+data.id);
    return;
  }
  if (data.op == "msg"){
    console.log("received!",data);
    room.messages.push(data);
    
  }else if (data.op == "name"){
    room.players[data.id].name = data.text;
    console.log("set name: "+data.id + "="+data.text);
  
  }else if (data.op == "room"){
    if (!(data.text in rooms)){
      rooms[data.text] = newRoom(data.text);
      console.log("new room opened: "+data.text);
    }
    if (locatePlayer(data.id) != data.text){
      rooms[data.text].players[data.id] = room.players[data.id]; 
      delete room.players[data.id];
    }
  }
}

function getDataForClient(id){
  var room = rooms[locatePlayer(id)];
  return Object.assign({}, room, {"room_list":Object.keys(rooms)});
}

function newConnection(socket){
	console.log('new connection: ' + socket.id);
  socket.on('client-start', onClientStart);
	socket.on('client-update', onClientUpdate);
	socket.on('disconnect', onClientExit);

	function onClientStart(){
		
    rooms.lobby.players[socket.id]= ({name:socket.id});
    
    var self_id = socket.id;
    var self_socket = socket;
		setInterval(heartbeat, 100);
		function heartbeat(){
			self_socket.emit('server-update', getDataForClient(self_id));
		} 
	}
  
	function onClientUpdate(data){
    updateServerData(data);
	}
  
	function onClientExit(){
    var room = rooms[locatePlayer(socket.id)];
    if (room != undefined){
      delete room.players[socket.id];
    }
    console.log(socket.id+' disconnected');
	}
}	


io.sockets.on('connection', newConnection);

