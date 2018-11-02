/* global describe io */

var clientData = {};
var serverData = {};
var socket = io();

function displayData(data){
  if (!data.messages){
    return ".";
  }
  var result = "";
  for (var i = 0; i < data.messages.length; i++){
    result += data.messages[i].id + "("+ data.messages[i].secret + "):\n"
    result += data.messages[i].text + "\n\n"
  }
  return result;
}


function main(){
  console.log("start");
  socket.emit('client-start')

  socket.on('server-update', function(data){
    serverData = data;
    clientData = data;
    document.getElementById("text0").innerHTML = displayData(serverData);
  })
  var btn = null;
  var btn = document.getElementById("button0");
  var inp = document.getElementById("input0");
  
  btn.onclick = function(){
    if (clientData.texts == undefined){
      clientData.messages = [];
    }
    clientData.messages.push({id:socket.id,text:inp.value,secret:Math.random()});
    socket.emit('client-update',clientData);
  }
}
window.onload = main;
