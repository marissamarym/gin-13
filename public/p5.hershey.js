/* global describe FONT_HERSHEY*/
var P5 = window;

P5.hershey={
  putChar : function(c,args){
    if (args == undefined){args = {}}
    if (args.font == undefined){args.font = FONT_HERSHEY.SIMPLEX}
    if (args.noise == undefined){args.noise = 2}
    var ordR = "R".charCodeAt(0);
    var offs = args.font[""+c.charCodeAt(0)-32]
    var entry = FONT_HERSHEY.DATA[offs];
    if (entry == undefined){
      return;
    }
    var cksum = 1*entry.slice(0,3);
    var bound = entry.slice(3,5);
    var xmin = 1*bound[0].charCodeAt(0)-ordR;
    var xmax = 1*bound[1].charCodeAt(0)-ordR;
    var content = entry.slice(5);
    P5.push();
    P5.translate(-xmin,0);
    P5.beginShape();
    for (var i = 0; i < content.length; i+=2){
      var digit = content.slice(i,i+2);
      if (digit == " R"){
        P5.endShape();
        P5.beginShape();
      }else{
        var x = digit[0].charCodeAt(0)-ordR;
        var y = digit[1].charCodeAt(0)-ordR;
        if (args.noise != 0){
          x += P5.noise(x*0.1,y*0.1,P5.frameCount*0.1+offs)*args.noise;
          y += P5.noise(P5.frameCount*0.1+offs,y*0.1,x*0.1)*args.noise;
        }
        P5.vertex(x,y);
      }
    }
    P5.endShape();
    P5.pop();
    return xmax-xmin;
  },
  putText : function (s, args){
    P5.push();
    for (var i = 0; i < s.length; i++){
      var x = P5.hershey.putChar(s[i],args);
      P5.translate(x,0);
    }
    P5.pop();
  },
  estimateTextWidth : function (s, args){
    for (var i 
  }
}