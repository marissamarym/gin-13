/* global describe io */

var forwData = {};
var backData = {};
var socket = io();


function main(){

  socket.emit('game-start', forwData)

  socket.on('heartbeat', function(data){
    if (data != null){
      backData = data;
    }
  })
  function loop(t){
    socket.emit('game-update', forwData); 
    window.requestAnimationFrame(loop);  
  }

  loop();

}




