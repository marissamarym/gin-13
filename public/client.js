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
  var shoulder_width = 50;
  var ground_height = 20
  var scale = upper_height/P5.dist(
    pose0.nose.x, pose0.nose.y , 
    P5.lerp(pose0.leftHip.x, pose0.rightHip.x,0.5),
    P5.lerp(pose0.leftHip.y, pose0.rightHip.y,0.5),
  );
  var xscale = Math.abs(pose0.leftShoulder.x-pose0.rightShoulder.x);
  if (xscale > P5.width*0.3){
    xscale = shoulder_width/(xscale*scale);
  }else{
    xscale = 1;
  }
  
  var basePos = {x:P5.lerp(pose0.leftHip.x, pose0.rightHip.x,0.5), y:P5.lerp(pose0.leftHip.y, pose0.rightHip.y,0.5)};
  var pose = {};
  for (var k in pose0){
    pose[k] = {x:(pose0[k].x-basePos.x)*scale*xscale+basePos.x,
               y:(pose0[k].y-basePos.y)*scale+P5.height-ground_height-lower_height
              }
  }
  pose.leftAnkle.y = P5.height-ground_height;
  pose.rightAnkle.y = P5.height-ground_height;
  pose.leftKnee.y = P5.height-ground_height-lower_height/2;
  pose.rightKnee.y = P5.height-ground_height-lower_height/2;
  
  try{
  var neck = {}
  neck.x = P5.lerp(pose.leftShoulder.x, pose.rightShoulder.x,0.5)
  var _ly = pose.leftShoulder.y

  var _ry = JSON.paJSON.stringify(pose.rightShoudler).y
  neck.y = P5.lerp(_ly, _ry,0.5)
  var waist = {}
  waist.x = P5.lerp(pose.leftHip.x, pose.rightHip.x,0.5)
  waist.y = P5.lerp(pose.leftHip.y, pose.rightHip.y,0.5)
  if (P5.dist(pose.nose.x, pose.nose.y , neck.x, neck.y)*0.25 >
      P5.dist(neck.x,neck.y,waist.x,waist.y)){
    var dis_l = {x:pose.leftShoulder.x-neck.x, y:pose.leftShoulder.y-neck.y} 
    var dis_r = {x:pose.rightShoulder.x-neck.x, y:pose.rightShoulder.y-neck.y}
    neck.x = P5.lerp(waist.x,neck.x,0.8);
    neck.y = P5.lerp(waist.y,neck.y,0.8);
    pose.leftShoulder.x = pose.neck.x + dis_l.x;
    pose.leftShoulder.y = pose.neck.y + dis_l.y;
    pose.rightShoulder.x = pose.neck.x + dis_r.x;
    pose.rightShoulder.y = pose.neck.y + dis_r.y;
  }
  }catch(e){
    console.log(e)
  }
  
  return pose
}

function warnDist(){
  if (localPlayer.pose != null){
    var d = P5.dist(localPlayer.pose.leftShoulder.x,localPlayer.pose.leftShoulder.y,
                localPlayer.pose.rightShoulder.x,localPlayer.pose.rightShoulder.y);
    P5.push();
    P5.textSize(16);
    P5.translate(P5.width/2, P5.height);
    P5.textAlign(P5.CENTER);
    P5.fill(255)
    if (d > P5.width*0.5){
      P5.text("SHOW YOUR LIMBS!", 0, 0);
    }else if (d > P5.width*0.3){
      P5.text("JUST A BIT FURTHER!", 0, 0);
    }
    P5.pop();
  }  
  
}

P5.setup = function() {
  socket = io();

  P5.createCanvas(640, 480);
  P5.background(0);
  P5.textFont('Courier');
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
      var col =  (socket.id == obj.id) ? [255,50] : obj.raw_data.color
      PoseReader.draw_pose(obj.pose,{color:col, stroke_weight:4});
    }
  }
  P5.image(PoseReader.video, 0, 0, P5.width*0.2, P5.height*0.2);
  if (localPlayer.pose != null){
    PoseReader.draw_pose(poseFormula(localPlayer.pose),{color:localPlayer.color})
    if (P5.dist(localPlayer.pose.leftShoulder.x,localPlayer.pose.leftShoulder.y,
                localPlayer.pose.rightShoulder.x,localPlayer.pose.rightShoulder.y) > P5.width/2){
    }
  }
  warnDist();
  
}



