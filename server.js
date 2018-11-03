// server.js
// where your node app starts

/////////////.////
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')

var io = require('socket.io')(server);

var serverData = {messages:[]};

function updateServerData(data){
  if (data.op == "msg"){
    serverData.messages.push(data);
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
    console.log(socket.id+' disconnected');
	}
}	


io.sockets.on('connection', newConnection);

