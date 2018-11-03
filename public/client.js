/* global describe io */

var serverData = {};
var socket = io();

function displayData(data){
  if (!data.messages){
    return ".";
  }
  var result = "";
  for (var i = 0; i < data.messages.length; i++){
    result += data.messages[i].id + " ("+ data.messages[i].timestamp + "):<br>"
    result += "<b>"+data.messages[i].text + "</b><br><br>"
  }
  return result;
}


function main(){
  console.log("start");
  socket.emit('client-start')

  socket.on('server-update', function(data){
    serverData = data;
    document.getElementById("text0").innerHTML = displayData(serverData);
  })
  
  document.getElementById("name-btn").onclick = function(){
    socket.emit('client-update',{
      op:"name",id:socket.id,
      text:document.getElementById("name-inp").value,
    });
  }
  
  document.getElementById("msg-btn").onclick = function(){
    socket.emit('client-update',{
      op:"msg",id:socket.id,
      text:document.getElementById("msg-inp").value,
      timestamp:new Date(),
    });
  }
}
window.onload = main;
