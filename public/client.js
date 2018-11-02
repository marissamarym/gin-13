/* global describe io */

var clientData = {};
var serverData = {};
var socket = io();


function main(){
  socket.emit('client-start')

  socket.on('server-update', function(data){
    serverData = data;
    clientData = data;
    document.getElementById("text0").innerHTML = JSON.stringify(serverData);
  })
  var btn = null;
  var btn = document.getElementById("button0");
  var inp = document.getElementById("input0");
  
  btn.onclick = function(){
    if (clientData.texts == undefined){
      clientData.texts = [];
    }
    clientData.texts.push(inp.value);
  }
}

document.main();

