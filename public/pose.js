/* global describe P5 ml5*/
var P5 = window;
var PoseReader = new function(){
  this.video = null
  this.poseNet = null
  this.pose = null
  this.posenet_objs = []
  this.track_smooth = 0.3

  this.init = function() {
    
    this.video = P5.createCapture(P5.VIDEO);
    this.video.size(P5.width,P5.height);

    function modelReady() {
      P5.select('#status').html('Model Loaded');
    }
    // Create a new poseNet method with a single detection
    this.poseNet = ml5.poseNet(this.video, modelReady);

    var self = this;
    
    this.poseNet.on('pose', function(results) {
      self._update(results);
      
    });
    // Hide the video element, and just show the canvas
    this.video.hide();
  }

  this._convert = function(posenet_obj){
    var result = {}
    var kpts = posenet_obj.pose.keypoints
    for (var i = 0; i < kpts.length; i++){
      result[kpts[i].part] = {
        x:P5.width-kpts[i].position.x,
        y:kpts[i].position.y
      }      
    }
    return result;
  }
  
  this.lerp_pose = function(poseA, poseB, t){
    for (var k in poseB){
      if (isNaN(poseA[k].x)){
        poseA[k].x = poseB[k].x
      }else{
        poseA[k].x = P5.lerp(poseA[k].x, poseB[k].x, t);
      }
      if (isNaN(poseA[k].y)){
        poseA[k].y = poseB[k].y
      }else{
        poseA[k].y = P5.lerp(poseA[k].y, poseB[k].y, t);
      }
    }
    
  }
  
  
  this._update = function(results){
    
    this.posenet_objs = results;
    if (results.length > 0){
      var new_pose = this._convert(this._get_largest_posenet_obj(results));
      if (this.pose == null){
        this.pose = new_pose
      }else{
        this.lerp_pose(this.pose, new_pose, this.track_smooth);
        
      }
    }
  }
  
  this._get_largest_posenet_obj = function(objs){
    var max_i = 0;
    var max_d = 0;
    for (var i = 0; i < objs.length; i++){
      var kpts = objs[i].pose.keypoints;
      var nose = kpts[0]
      var leftEye = kpts[1]
      var d = P5.dist(nose.x,nose.y,leftEye.x,leftEye.y);
      if (d > max_d){
        max_d = d;
        max_i = i;
      }
    }
    return objs[max_i];
  }
  
  this.get = function(){
    return this.pose;
  }
  
  this.draw = function(){
    if (this.pose != null){
      this.draw_pose(this.get());
    }
  }
  
  this.estimate_scale = function(pose){
    return P5.dist(pose.nose.x, pose.nose.y , pose.leftEye.x, pose.leftEye.y);
    
  }
  
  this._draw_bones = function(){
    P5.beginShape()
    for (var i = 0; i < arguments.length; i++){
      P5.vertex(arguments[i].x, arguments[i].y);
    }
    P5.endShape()
  }
  
  this._draw_head = function(pose){
    var ang = P5.atan2(pose.leftEar.y-pose.rightEar.y,pose.leftEar.x-pose.rightEar.x);
    var r = P5.dist(pose.leftEar.x,pose.leftEar.y,pose.rightEar.x,pose.rightEar.y);
    P5.arc((pose.leftEar.x+pose.rightEar.x)/2, (pose.leftEar.y+pose.rightEar.y)/2, r,r, ang, ang+P5.PI);
    var neck = {x:(pose.leftShoulder.x + pose.rightShoulder.x)/2, y:(pose.leftShoulder.y + pose.rightShoulder.y)/2,}
    P5.line(pose.leftEar.x,pose.leftEar.y,neck.x,neck.y);
    P5.line(pose.rightEar.x,pose.rightEar.y,neck.x,neck.y);
  }
  
  
  this.draw_pose = function(pose, args) {
    if (args == undefined){args = {}}
    if (args.color == undefined){args.color = [255,255,255]}
    if (args.stroke_weight == undefined){args.stroke_weight = 4}
    
    P5.push();
    
    P5.colorMode(P5.HSB, 255);
    P5.stroke.apply(this, args.color);
    P5.strokeWeight(args.stroke_weight);
    
    P5.strokeJoin(P5.ROUND);
    
    P5.noFill();

    
    this._draw_bones(pose.leftShoulder, pose.rightShoulder, pose.rightHip, pose.leftHip, pose.leftShoulder);
    
    this._draw_bones(pose.leftShoulder, pose.leftElbow, pose.leftWrist);
    
    this._draw_bones(pose.rightShoulder, pose.rightElbow, pose.rightWrist);

    this._draw_bones(pose.leftHip, pose.leftKnee, pose.leftAnkle);
    this._draw_bones(pose.rightHip, pose.rightKnee, pose.rightAnkle);
    
    this._draw_head(pose);
    
    // this._draw_bones(pose.nose, pose.leftEye);
    // this._draw_bones(pose.nose, pose.rightEye);
    // this._draw_bones(pose.leftEye, pose.leftEar);
    // this._draw_bones(pose.rightEye, pose.rightEar);
    
    var s = this.estimate_scale(pose);
    
    P5.fill(0);
    P5.ellipse(pose.leftEye.x, pose.leftEye.y, s*0.8, s*0.8);
    P5.ellipse(pose.rightEye.x, pose.rightEye.y, s*0.8, s*0.8);
    P5.pop();
  }
}