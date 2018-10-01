/* global describe P5 ml5 p5*/
var P5 = window;
var SpeechBubble = new function(){
  this.recognizer = null
  this.speech = {text:"",len:0}
  this.init = function(){
    this.recognizer = new p5.SpeechRec('en-US', function(){}); // new P5.SpeechRec object
    this.recognizer.continuous = true; // do continuous recognition
    this.recognizer.interimResults = true; // allow partial recognition (faster, less accurate)
    this.recognizer.start();
    conso
    setInterval(this._update,100);
  }
  this._update = function(){
    var result = this.recognizer.resultString
    if (result != undefined){
      if (this.speech.text != result ){
        if (this.speech.text.indexOf(result) == -1
        &&  this.recognizer.resultString.length > 0){
          this.speech.text = result;
          this.speech.len = result.length*2;
        }else{
          this.speech.len = this.speech.text.length*2;
        }
      }
    }
    if (this.speech.len > 0){
      this.speech.len -= 1;
    }else{
      this.speech.len = 0;
    }
  }
  this.draw_speech = function(speech){
    console.log(speech);
    P5.push();
    P5.textSize(16);
    P5.textAlign(P5.LEFT);
    P5.textFont("Courier");
    P5.fill(255)
    P5.text(speech.text.slice(0,Math.ceil(speech.len)), 0, 0);
    P5.pop();
  }
  
}