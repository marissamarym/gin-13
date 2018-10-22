/* global describe FONT_HERSHEY_SIMPLEX*/
var P5 = window;
function drawChr(c){
  var entry = FONT_HERSHEY_SIMPLEX[""+c.charCodeAt(0)];
  if (entry == undefined){
    return;
  }
  var cksum = 1*entry.slice(0,3);
  var content = entry.slice(3);
  for (var i = 0; i < con
}