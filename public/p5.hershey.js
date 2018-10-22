/* global describe FONT_HERSHEY*/
var P5 = window;

P5.hershey={
  drawChr : function(c){
    var ordR = "R".charCodeAt(0);
    var offs = FONT_HERSHEY.SIMPLEX[""+c.charCodeAt(0)-32]
    var entry = FONT_HERSHEY.DATA[offs];

    if (entry == undefined){
      return;
    }
    var cksum = 1*entry.slice(0,3);
    var bound = entry.slice(3,5);
    var content = entry.slice(5);
    P5.beginShape();
    for (var i = 0; i < content.length; i+=2){
      var digit = content.slice(i,i+1);
      if (digit == " R"){
        P5.endShape();
        P5.beginShape();
      }else{
        var x = digit[0].charCodeAt(0)-ordR;
        var y = digit[1].charCodeAt(0)-ordR;
        console.log(x,y);
        P5.vertex(x,y);
      }
    }
    P5.endShape();
  },
}