/* global describe io p5*/

var universe = {players:[],objects:[]};
var socket;

new p5( function( sketch ) {
  sketch.setup = function() {
    socket = io();

    sketch.createCanvas(640, 480);
    sketch.background(0);

    socket.emit('game-start', {})
    socket.on('heartbeat', function(data){
      universe = data;
    })
  }
  sketch.draw = function() {
    sketch.background(0);
    socket.emit('game-update', {});
    console.log(universe);
    for (var i = 0; i < universe.objects.length; i++) {
      var obj = universe.objects[i];
      if (obj.name == "box"){
        sketch.push();     
        sketch.fill(255);
        sketch.translate(obj.x,obj.y);
        sketch.rotate(obj.rotation);
        sketch.rect(obj.width,obj.height);
        sketch.pop();
      }
	  }
  }
});



