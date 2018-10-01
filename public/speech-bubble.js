/* global describe P5 ml5 p5*/
var P5 = window;
var SpeechBubble = new function(){
  this.recognizer = null
  this.speech = {text:"",len:""}
  this.init = function(){
    this.recognizer = new p5.SpeechRec('en-US', function(){}); // new P5.SpeechRec object
    this.recognizer.continuous = true; // do continuous recognition
    this.recognizer.interimResults = true; // allow partial recognition (faster, less accurate)
    this.recognizer.start();
  }
  this.update = function(){
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
  
}