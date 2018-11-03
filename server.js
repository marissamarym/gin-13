// server.js
// where your node app starts

/////////////.////
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')

var io = require('socket.io')(server);

var serverData = {};

function updateServerData(id){
  serverData = clientsData[id];
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
    clientsData[socket.id] = data;
    updateServerData(socket.id);
	}
  
	function onClientExit(){
    for (var k in clientsData) {
      if(socket.id == k){
        clientsData[k] = undefined;
        console.log(k+' disconnected');
        break;
      }
		}
	}
}	


io.sockets.on('connection', newConnection);

