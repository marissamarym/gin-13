// server.js
// where your node app starts

////////////.
var express = require('express'); 
var app = express();
var server = app.listen(process.env.PORT || 300);
app.use(express.static('public'));
console.log('server running')

var socket = require('socket.io');
var io = socket(server);

var serverData = {};
var clientsData = {};
var serverStatus = {};

function updateServerData(){
  serverData = {}
  for (var k in clientsData){
    serverData[k] = clientsData[k];
  }
}

function getDataForClient(id){
  return serverData;
}

function newConnection(socket){
	console.log('new connection: ' + socket.id);
  socket.on('client-start', onClientStart);
	socket.on('client-update', onClientUpdate);
	socket.on('disconnect', onClientRequestExit);

	function onClientStart(){
		
    var self_id = socket.id;
    
		setInterval(heartbeat, 50);
		function heartbeat(){
			io.sockets.emit('server-update', getDataForClient(self_id));
		} 
	}
  
	function onClientUpdate(data){
    clientsData[socket.id] = data;
    updateServerData();
	}
  
	function onClientRequestExit(){
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

