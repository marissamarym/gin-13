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
    //document.getElementById("debug").innerHTML = `<font size="0.1">`+JSON.stringify(serverData)+`</font>`;
    var newhtml = displayData(serverData);
    if (document.getElementById("msg-disp").innerHTML != newhtml){
      document.getElementById("msg-disp").innerHTML = newhtml
      document.getElementById("msg-disp").scrollTop = document.getElementById("msg-disp").scrollHeight;
    }
    
  })
  document.getElementById('room-inp').value = "lobby";
  document.getElementById('name-inp').value = socket.id;
  
  document.getElementById("room-btn").onclick = function(){
    socket.emit('client-update',{
      op:"room",id:socket.id,
      text:document.getElementById("room-inp").value,
    });
  }
  
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
