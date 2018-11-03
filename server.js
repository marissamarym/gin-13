// server.js
// where your node app starts

/////////////.////
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')

var io = require('socket.io')(server);

var rooms = {{id="lobby",messages:[],players:{}}};

function updateServerData(data){
  if (data.op == "msg"){
    serverData.messages.push(data);
    
  }else if (data.op == "name"){
    serverData.players[data.id].name = data.text;
    console.log("set name: "+data.id + "="+data.text);
  }
}

function getDataForClient(id){
  return serverData;
}

function newConnection(socket){
	console.log('new connection: ' + socket.id);
  socket.on('client-start', onClientStart);
	socket.on('client-update', onClientUpdate);
	socket.on('disconnect', onClientExit);

	function onClientStart(){
		
    serverData.players[socket.id]= ({name:socket.id});
    
    var self_id = socket.id;
    var self_socket = socket;
		setInterval(heartbeat, 500);
		function heartbeat(){
			self_socket.emit('server-update', getDataForClient(self_id));
		} 
	}
  
	function onClientUpdate(data){
    updateServerData(data);
	}
  
	function onClientExit(){
    for (var i = serverData.players.length-1; i >= 0; i--){
      if (serverData.players[i].id == socket.id){
        serverData.players.splice(i,1);
      }
    }
    console.log(socket.id+' disconnected');
	}
}	


io.sockets.on('connection', newConnection);

