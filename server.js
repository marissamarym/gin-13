// server.js
// where your node app starts

/////////////.////
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')

var io = require('socket.io')(server);

var rooms = {"lobby":{messages:[],players:{}}};

function locatePlayer(id){
  for (var k in rooms){
    if (id in rooms[k].players){
      return k;
    }
  }
}

function updateServerData(data){
  var room = rooms[locatePlayer(data.id)];
  if (data.op == "msg"){
    room.messages.push(data);
    
  }else if (data.op == "name"){
    room.players[data.id].name = data.text;
    console.log("set name: "+data.id + "="+data.text);
  }
}

function getDataForClient(id){
  var room = rooms[locatePlayer(id)];
  return room;
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
		setInterval(heartbeat, 200);
		function heartbeat(){
			self_socket.emit('server-update', getDataForClient(self_id));
		} 
	}
  
	function onClientUpdate(data){
    updateServerData(data);
	}
  
	function onClientExit(){
    var room = rooms[locatePlayer(socket.id)];
    delete room.players[socket.id];
    console.log(socket.id+' disconnected');
	}
}	


io.sockets.on('connection', newConnection);

