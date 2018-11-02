/* global describe io */

var clientData = {};
var serverData = {};
var socket = io();


function main(){
  socket.emit('client-start')

  socket.on('server-update', function(data){
    if (data != null){
      serverData = data;
      
    }
  })
  var btn = document.getElementById("button0")
  btn.onclick = function(){
    
    
    socket.emit('client-update', clientData); 
  }
}


main();

