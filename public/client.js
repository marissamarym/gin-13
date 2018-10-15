/* global describe io P5 PoseReader SpeechBubble p5*/

var socket;
var room = {name:"",players:[],objects:[]};
var P5 = window; //p5 pollutes global namespace
                 //this makes it look like that it doesn't
                 //so it feels nicer

var localPlayer = {pose:null, color:[Math.random()*255,100,255], speech:{text:"",len:0}}
var USE_SPEECH = false;
var VIEW_ONLY = false;
if (!window.chrome){
  alert("Some functionalities are not supported by your browser. Please use Chrome. You'll be entering view only mode now.")
  VIEW_ONLY = true;
}

function warnDist(){
  if (PoseReader.get() != null){
    var d = P5.dist(PoseReader.get().leftShoulder.x,PoseReader.get().leftShoulder.y,
                    PoseReader.get().rightShoulder.x,PoseReader.get().rightShoulder.y);
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
  
  if (!VIEW_ONLY){
    PoseReader.init();
    if (USE_SPEECH){SpeechBubble.init()}
    socket.emit('game-start', localPlayer)
  }
  socket.on('heartbeat', function(data){
    if (data != null){
      room = data;
    }
  })
  
  if (VIEW_ONLY){P5.select('#status').html('VIEW ONLY - USE CHROME TO PLAY');}
}
P5.draw = function() {
  P5.background(0);
  
  localPlayer.pose = PoseReader.get_normalized();
  if (USE_SPEECH){SpeechBubble.update(localPlayer.speech);}
  socket.emit('game-update', localPlayer);
  
  // console.log(room);
  
  for (var i = 0; i < room.objects.length; i++) {
    var obj = room.objects[i];
    if (obj.name == "box"){
      P5.push();
      var attached = false;
      for (var j = 0; j < room.players.length; j++){
        if (room.players[j].hand.includes(obj.id)){
          attached = true;
          break;
        }
      }
      if (attached){
        P5.stroke(255);
      }else{
        P5.stroke(0,255,255);
      }
      P5.strokeWeight(4);
      P5.noFill();
      P5.translate(obj.x,obj.y);
      P5.rotate(obj.rotation);
      P5.rect(-obj.width/2,-obj.height/2,obj.width,obj.height);
      P5.pop();
    }
  }
  
  var local_offset = {x:0, y:0}
  for (var i = 0; i < room.players.length; i++) {
    var obj = room.players[i];
    if (obj.pose != null){
      P5.push();
      P5.translate(obj.offset.x, obj.offset.y);
      var col =  (socket.id == obj.id) ? [255,50] : obj.raw_data.color
      PoseReader.draw_pose(obj.pose,{color:col, stroke_weight:4});
      P5.pop();
      if (socket.id == obj.id){
        local_offset = obj.offset;
      }
    }
    if (USE_SPEECH && obj.raw_data.speech != null && obj.pose != null){
      P5.push();
      P5.translate(obj.pose.nose.x, obj.pose.nose.y-60);
      SpeechBubble.draw_speech(obj.raw_data.speech);
      P5.pop();
    }
  }
  //P5.image(PoseReader.video, 0, 0, P5.width*0.2, P5.height*0.2);
  if (localPlayer.pose != null){
    P5.push();
    P5.translate(local_offset.x, local_offset.y);
    var ret = PoseReader.extract_offset(localPlayer.pose);
    PoseReader.draw_pose(ret.pose,{color:localPlayer.color})
    
    
    P5.push();
    P5.strokeWeight(4);
    P5.stroke(255);
    P5.noFill();
    P5.translate(localPlayer.pose.nose.x, 150);
    P5.triangle(-6,0,6,0,0,10)
    
    P5.pop();
    P5.pop();
  }
  warnDist();
  
  P5.push();
  P5.textSize(16);
  P5.translate(P5.width/2, 50);
  P5.textAlign(P5.CENTER);
  P5.fill(255,0,255)
  P5.text("room: "+room.name, 0, 0);
  P5.pop();
  
}



