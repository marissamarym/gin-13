/* global describe io createCanvas background*/

var universe = {};
var socket;

function setup() {
  socket = io();
  
  createCanvas(640, 480);
  background(0);
  
	socket.emit('game-start', {})
	socket.on('heartbeat', function(data){
		universe = data;
	})

}

function draw() {

  background(0);

	socket.emit('game-update', {});
  console.log(universe);
	for (var i = 0; i < universe.objects.length; i++) {
    var obj = universe.objects[i];
	}

  
}