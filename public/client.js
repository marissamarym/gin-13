/* global describe io */

var clientData = {};
var serverData = {};
var socket = io();


function main(){
  socket.emit('client-start', clientData)
  socket.on('server-update', function(data){
    if (data != null){
      serverData = data;
    }
  })
  function loop(){
    socket.emit('client-update', clientData); 
    setTimeout(loop,100); 
  }
  loop();
}


main();

