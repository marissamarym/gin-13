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

function getClientAccessData(id){
  return serverData;
}

function newConnection(socket){
	console.log('new connection: ' + socket.id);
	socket.on('client-start', startClient);
	socket.on('client-update', updateClient);
	socket.on('disconnect', endClient);

	function startClient(data){
		console.log(socket.id)
		

		setInterval(heartbeat, 50)

		function heartbeat(){
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
      for (var j = 0; j < universe[i].players.length; j++){
        if(socket.id == universe[i].players[j].id){
          universe[i].players.splice(j, 1)
          console.log('disconnected')
          break;
        }
      }
		}
	}
}	

serverInit()

io.sockets.on('connection', newConnection);

