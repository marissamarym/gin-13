/* global describe io */

var serverData = {};
var socket = io();


function displayData(data){
  if (!data.messages){
    return ".";
  }
  var result = "";
  for (var i = 0; i < data.messages.length; i++){
    var player = data.players[data.messages[i].id]
    var name = (player != undefined) ? player.name : data.messages[i].id;
    var isme = (socket.id == data.messages[i].id) ? " (You) " : "";
    var time = (new Date(data.messages[i].timestamp)).toTimeString().split(" ")[0];
    result += "<div class='msg-item'><b>" + name + isme + "</b> ["+ time + "]:<br>"
    result += "<font size='4'>"+data.messages[i].text + "</font></div>"
  }
  result += ""
  return result;
}


function main(){
  console.log("start");
  socket.emit('client-start')

  socket.on('server-update', function(data){
    serverData = data;
    //document.getElementById("debug").innerHTML = `<font size="0.1">`+JSON.stringify(serverData)+`</font>`;
    var newhtml = displayData(serverData);
    document.getElementById("room-name").innerHTML = "Room <i>"+serverData.name+"</i>";
    document.getElementById("room-list").innerHTML = "<b>open rooms:</b>\n"+serverData.room_list.join("\n");
    // console.log(newhtml)
    
    if (document.getElementById("msg-disp").innerHTML.length != newhtml.length){
      document.getElementById("msg-disp").innerHTML = newhtml
      document.getElementById("msg-disp").scrollTop = document.getElementById("msg-disp").scrollHeight;
    }
    window.cardResolve(serverData.cards);
    window.DESK_ROT = serverData.players[socket.id].idx;
    document.getElementById('name-inp').value = serverData.players[socket.id].name;
    
    for (var k in serverData.players){
      var p = serverData.players[k];
      var ab = document.getElementById("areabox-"+p.idx);
      var isme = (k == socket.id)? " (You)" : "";
      ab.innerHTML = `<div style="padding:5px">PLAYER `+(p.idx+1)+": "+p.name+isme+`</div>`
    }
    
    
  })
//   document.getElementById('room-inp').value = "lobby";
  document.getElementById('name-id').innerHTML = "id="+socket.id;
  
//   document.getElementById("room-btn").onclick = function(){
//     socket.emit('client-update',{
//       op:"room",id:socket.id,
//       text:document.getElementById("room-inp").value,
//     });
//   }
  
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
      timestamp:(new Date()).getTime(),
    });
    
    
  }

}
window.onload = function(){
  main();
  window.cardMain(function(data){
    socket.emit('client-update',{
      op:"movc",id:socket.id,
      cards:data.cards, targs:data.targs,
      timestamp:(new Date()).getTime(),
    });
  });
  var viewportupdate = function(){
    document.getElementById("main").style.left = (window.innerWidth/2-((window.WIDTH+400)/2))+"px";
    document.getElementById("main").style.top = (window.innerHeight/2-(window.HEIGHT/2))+"px";
    window.setTimeout(viewportupdate,1000);
  }
  viewportupdate();
  
};
