/* global describe P5 ml5 p5*/
var P5 = window;
var SpeechBubble = new function(){
  this.recognizer = null

  this.init = function(){
    this.recognizer = new p5.SpeechRec('en-US', function(){}); // new P5.SpeechRec object
    this.recognizer.continuous = true; // do continuous recognition
    this.recognizer.interimResults = true; // allow partial recognition (faster, less accurate)
    this.recognizer.start();
  }
  this.update = function(speech){
    var result = this.recognizer.resultString
    if (result != undefined){
      if (speech.text != result ){
        if (speech.text.indexOf(result) == -1
        &&  this.recognizer.resultString.length > 0){
          speech.text = result;
          speech.len = result.length*2;
        }else{
          speech.len = speech.text.length*2;
        }
      }
    }
    if (speech.len > 0){
      speech.len -= 1;
    }else{
      speech.len = 0;
    }
  }
  this.draw_speech = function(speech, args){
    if (args == undefined){args = {}}
    if (args.color == undefined){args.color = [255,255,0]}
    if (args.stroke_weight == undefined){args.stroke_weight = 2}
    
    P5.push();
    P5.textSize(16);
    P5.textAlign(P5.LEFT);
    P5.textFont("Courier");
    
    var t = speech.text.slice(0,Math.ceil(speech.len))
    if (t.length == 0){
      P5.pop();
      return;
    }
    var w = P5.textWidth(t);
    var h = 30
    var dx = 5
    var dy = -30
    var o = Math.min(w,20)
    
    P5.strokeWeight(args.stroke_weight);
    P5.stroke.apply(this, args.color);
    P5.line(0,0,dx,dy+h/2)
    P5.line(0,0,dx+o,dy+h/2)
    
    P5.push();
    P5.translate(dx,dy)
    P5.strokeWeight(args.stroke_weight);
    P5.stroke.apply(this, args.color);
    P5.noFill();
    P5.arc(0,0,h,h,P5.HALF_PI,P5.HALF_PI+P5.PI)
    P5.arc(w,0,h,h,-P5.HALF_PI,P5.HALF_PI)
    P5.line(0,-h/2,w,-h/2);
    P5.line(o,h/2,w,h/2);
    P5.fill.apply(this, args.color);
    P5.noStroke();
    P5.text(t, 0, +5);
    P5.pop()
    
    P5.pop();
  }
  
}