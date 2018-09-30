/* global describe io P5*/

var universe = {players:[],objects:[]};
var socket;
v

function setup() {
  socket = io();

  window.createCanvas(640, 480);
  window.background(0);

  socket.emit('game-start', {})
  socket.on('heartbeat', function(data){
    universe = data;
  })
}
P5.draw = function() {
  P5.background(0);
  socket.emit('game-update', {});
  console.log(universe);
  for (var i = 0; i < universe.objects.length; i++) {
    var obj = universe.objects[i];
    if (obj.name == "box"){
      P5.push();     
      P5.stroke(0,255,255);
      P5.noFill();
      P5.translate(obj.x,obj.y);
      P5.rotate(obj.rotation);
      P5.rect(-obj.width/2,-obj.height/2,obj.width,obj.height);
      P5.pop();
    }
  }
}



