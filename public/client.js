/* global describe io P5 PoseReader Player*/
var socket;
var universe = {players:[],objects:[]};
var P5 = window; //p5 pollutes global namespace
                 //this makes it look like that it doesn't
                 //so it feels nicer

var localPlayer = {pose:null, color:[Math.random()*255,100,255]}

function poseFormula(pose0){
  var upper_height = 100;
  var lower_height = 100;
  var scale = upper_height/P5.dist(
    pose0.nose.x, pose0.nose.y 
    lerp(pose0.leftHip.x, pose0.rightHip.x,0.5));
  var basePos = v3.lerp(pose0.leftHip, pose0.rightHip,0.5);
  var pose = {}
  for (var k in pose0){
    pose[k] = v3.add(v3.scale(v3.subtract(pose0[k],basePos),scale),
                     {x:basePos.x, y:CANVAS_HEIGHT-GROUND_HEIGHT-lower_height})
  }
  pose.leftAnkle.y = CANVAS_HEIGHT-GROUND_HEIGHT;
  pose.rightAnkle.y = CANVAS_HEIGHT-GROUND_HEIGHT;
  pose.leftKnee.y = CANVAS_HEIGHT-GROUND_HEIGHT-lower_height/2;
  pose.rightKnee.y = CANVAS_HEIGHT-GROUND_HEIGHT-lower_height/2;
  return pose
}

P5.setup = function() {
  socket = io();

  P5.createCanvas(640, 480);
  P5.background(0);

  PoseReader.init();
  
  socket.emit('game-start', localPlayer)
  socket.on('heartbeat', function(data){
    universe = data;
  })
}
P5.draw = function() {
  P5.background(0);
  
  localPlayer.pose = PoseReader.get();
    
  socket.emit('game-update', localPlayer);
  //console.log(universe);
  
  for (var i = 0; i < universe.objects.length; i++) {
    var obj = universe.objects[i];
    if (obj.name == "box"){
      P5.push();     
      P5.stroke(0,255,255);
      P5.strokeWeight(4);
      P5.noFill();
      P5.translate(obj.x,obj.y);
      P5.rotate(obj.rotation);
      P5.rect(-obj.width/2,-obj.height/2,obj.width,obj.height);
      P5.pop();
    }
  }
  
  for (var i = 0; i < universe.players.length; i++) {
    var obj = universe.players[i];
    if (obj.pose != null){
      PoseReader.draw_pose(obj.pose,{color:obj.raw_data.color, stroke_weight:4});
    }
  }
  P5.image(PoseReader.video, 0, 0, P5.width*0.2, P5.height*0.2);
  // if (localPlayer.pose != null){
  //   PoseReader.draw_pose(localPlayer.pose,{color:localPlayer.color})
  // }
}



