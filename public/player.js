/* global describe*/
function Player(){
  this.data = {
    pose : null,
    color: [Math.random()*255,100,255]
  }
	this.update = function(pose){
    this.data.pose = pose;
	}
}