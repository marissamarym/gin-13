/* global describe io P5 PoseReader Player*/
var socket;
var universe = {players:[],objects:[]};
var P5 = window; //p5 pollutes global namespace
                 //this makes it look like that it doesn't
                 //so it feels nicer

var localPlayer = Player();

P5.setup = function() {
  socket = io();

  P5.createCanvas(640, 480);
  P5.background(0);

  PoseReader.init();
  
  socket.emit('game-start', localPlayer.data)
  socket.on('heartbeat', function(data){
    universe = data;
  })
}
P5.draw = function() {
  P5.background(0);
  socket.emit('game-update', localPlayer.data);
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



