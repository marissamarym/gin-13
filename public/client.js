/* global describe io */

var serverData = {};
var socket = io();




function displayData(data){
  if (!data.messages){
    return ".";
  }
  var result = "<ul>";
  for (var i = 0; i < data.messages.length; i++){
    var player = data.players[data.messages[i].id]
    var name = (player != undefined) ? player.name : data.messages[i].id;
    result += "<li><b>" + name + "</b> [id="+data.messages[i].id+"] @"+ data.messages[i].timestamp + ":<br>"
    result += "<pre>"+data.messages[i].text + "</pre></li>"
  }
  result += "</ul>"
  return result;
}


function main(){
  console.log("start");
  socket.emit('client-start')

  socket.on('server-update', function(data){
    serverData = data;
    document.getElementById("debug").innerHTML = JSON.stringify(serverData);
    document.getElementById("msg-disp").innerHTML = displayData(serverData);
    
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
