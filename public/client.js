/* global describe io P5 PoseReader SpeechBubble p5 FONT_HERSHEY*/

var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 480;

var socket;
var room = {name:"",players:[],objects:[]};
var P5 = window; //p5 pollutes global namespace
                 //this makes it look like that it doesn't
                 //so it feels nicer

var localPlayer = {pose:null, color:[Math.random()*255,100,255], speech:{text:"",len:0}}
var USE_SPEECH = true;
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

    P5.translate(P5.width/2, P5.height);

    P5.stroke(255);
    P5.noFill();
    P5.strokeWeight(2);
    P5.scale(0.5);
    if (d > P5.width*0.5){
      P5.hershey.putText("SHOW YOUR LIMBS!", {align:"center",noise:0.5});
    }else if (d > P5.width*0.3){
      P5.hershey.putText("JUST A BIT FURTHER!", {align:"center",noise:0.5});
    }
    P5.pop();
  }  
  
}

function colorEq(c0,c1){
  if (c0.length != c1.length){
    return false;
  }
  for (var i = 0; i < c0.length; i++){
    if (c0[i] != c1[i]){
      return false
    }
  }
  return true;
}

P5.setup = function() {
  socket = io();

  P5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
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
  P5.shearY(-P5.radians(5));
  
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
        P5.stroke(0,255,255);
      }else{
        P5.stroke(255);
      }
      P5.strokeWeight(1);
      P5.noFill();
      P5.translate(obj.x,obj.y);
      P5.rotate(obj.rotation);
      P5.rect(-obj.width/2,-obj.height/2,obj.width,obj.height);
      P5.pop();
    }else if (obj.name == "dot"){
      P5.push();
      P5.noStroke();
      P5.colorMode(P5.HSB, 255);
//       P5.fill.apply(this, obj.color);
//       P5.ellipse(obj.x,obj.y,4,4);
      
      var next_dot = undefined;
      for (var j = i+1; j < room.objects.length; j++) {
        if (room.objects[j].name == "dot" && colorEq(room.objects[j].color,obj.color)){
          next_dot = room.objects[j];
          break;
        }
      }
      if (next_dot != undefined){
  
        P5.stroke.apply(this, obj.color);
        P5.strokeWeight(1);
        P5.noFill()
        P5.line(obj.x,obj.y,next_dot.x,next_dot.y);
        
      }
      P5.pop()
    }
  }
  
  var local_offset = {x:0, y:0}
  for (var i = 0; i < room.players.length; i++) {
    var obj = room.players[i];
    if (obj.pose != null){
      P5.push();
      P5.translate(obj.offset.x, obj.offset.y);
      var col =  (socket.id == obj.id) ? [255,50] : obj.raw_data.color
      PoseReader.draw_pose_v2(obj.pose,{color:col, stroke_weight:1});
      P5.pop();
      if (socket.id == obj.id){
        local_offset = obj.offset;
      }
    }
    if (USE_SPEECH && obj.raw_data.speech != null && obj.pose != null){
      P5.push();
      P5.translate(obj.offset.x+obj.pose.nose.x, obj.offset.y+obj.pose.nose.y-60);
      SpeechBubble.draw_speech(obj.raw_data.speech);
      P5.pop();
    }
  }
  //P5.image(PoseReader.video, 0, 0, P5.width*0.2, P5.height*0.2);
  if (localPlayer.pose != null){
    P5.push();
    P5.translate(local_offset.x, local_offset.y);
    var ret = PoseReader.extract_offset(localPlayer.pose);
    PoseReader.draw_pose_v2(ret.pose,{color:localPlayer.color,stroke_weight:1})
    
    
    P5.push();
    P5.strokeWeight(1);
    P5.stroke(255);
    P5.noFill();
    P5.translate(0, -250);
    P5.triangle(-6,0,6,0,0,10)
    
    P5.pop();
    P5.pop();
  }
  warnDist();
  
  P5.push();
  P5.strokeWeight(1);
  P5.translate(P5.width/2, 50);
  P5.scale(1);
  P5.stroke(255);
  P5.noFill();
  
  P5.hershey.putText("room: "+room.name,{font:FONT_HERSHEY.SIMPLEX,align:"center",noise:0.5});
  P5.pop();
  
  P5.push();
  P5.noFill();
  P5.stroke(255,0,0);
  P5.strokeWeight(1);
  P5.rect(CANVAS_WIDTH-10,CANVAS_HEIGHT/2-10,20,20);
  P5.pop();
  
  
  var canv = document.getElementById("defaultCanvas0");
  
  var scale = 0.9*window.innerHeight/P5.height;
  var scale_str = "scale("+scale+")";
  canv.style.transform = scale_str;
  // console.log(canv.style.transform);
  
}



