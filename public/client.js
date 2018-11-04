/* global describe io */

var serverData = {};
var socket = io();
var old_msg_cnt = 0;

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
    result += "<div class='msg-item'><font size='1'><b>" + name + isme + "</b> ["+ time + "]:</font><br>"
    result += ""+data.messages[i].text + "</font></div>"
  }
  result += ""
  return result;
}

function roomBtn(element){
  window.location.href = window.location.href.split("?")[0]+"?room="+element.innerHTML;
}

function parseQuery(){
  var q = window.location.href.split("?")[1];
  var qs = q.split("&");
  var result = {}
  for (var i = 0; i < qs.length; i++){
    result[qs[i].split("=")[0]] = qs[i].split("=")[1];
  }
  return result
}

function main(){
  console.log("start");
  
  var init_settings = {}; 
  try{
    init_settings = parseQuery();
  }catch(e){
  }
  console.log(init_settings);
  socket.emit('client-start',init_settings)

  socket.on('server-update', function(data){
    serverData = data;
    //document.getElementById("debug").innerHTML = `<font size="0.1">`+JSON.stringify(serverData)+`</font>`;
    var newhtml = displayData(serverData);
    document.getElementById("room-name").innerHTML = "Room <b><i>"+serverData.name+"</i></b>";
    var room_sp = "<span class='room-item' onmousedown='roomBtn(this)'>";
    document.getElementById("room-list").innerHTML = "goto"+room_sp+serverData.room_list.join("</span>"+room_sp)+"</span>";
    // console.log(newhtml)
    
    if (data.messages.length != old_msg_cnt){
      document.getElementById("msg-disp").innerHTML = newhtml
      document.getElementById("msg-disp").scrollTop = document.getElementById("msg-disp").scrollHeight;
      old_msg_cnt = data.messages.length;
    }
    window.cardResolve(serverData.cards);
    window.DESK_ROT = serverData.players[socket.id].idx;
    // document.getElementById('name-inp').value = serverData.players[socket.id].name;
    document.getElementById('name-id').innerHTML = "id="+socket.id;
    
    for (var i = 0; i < 4; i++){
      var ab = document.getElementById("areabox-"+i);
      ab.innerHTML = `<div style="padding:5px">EMPTY</div>`
    }
    for (var k in serverData.players){
      var p = serverData.players[k];
      var ab = document.getElementById("areabox-"+p.idx);
      var isme = (k == socket.id)? " (You)" : "";
      ab.innerHTML = `<div style="padding:5px">PLAYER `+(p.idx+1)+": "+p.name+isme+`</div>`
    }

    
    
  })
//   document.getElementById('room-inp').value = "lobby";
  
  try{
    document.getElementById('name-inp').value = socket.id.slice(0,6);
  }catch(e){
  }
  
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
  document.getElementById("msg-inp").addEventListener("keyup", function(event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Trigger the button element with a click
      document.getElementById("msg-btn").click();
    }
  });
  
  
  document.getElementById("msg-btn").onclick = function(){
    socket.emit('client-update',{
      op:"msg",id:socket.id,
      text:document.getElementById("msg-inp").value,
      timestamp:(new Date()).getTime(),
    });
  };

  document.getElementById("shuffle-btn").onclick = function(){
    socket.emit('client-update',{
      op:"shfl",id:socket.id,
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
    var maindiv = document.getElementById("main");
    var dh = Math.max(window.HEIGHT,window.innerHeight)
    document.body.style.height = dh+"px";
    // var scale = 0.9*window.innerHeight/window.HEIGHT;
    // var scale_str = "scale("+scale+")";
    // maindiv.style.transform = scale_str;
    maindiv.style.left = (window.innerWidth/2-((window.WIDTH+400)/2))+"px";
    maindiv.style.top = (dh/2-(window.HEIGHT/2))+"px";
    window.setTimeout(viewportupdate,1000);
  }
  viewportupdate();
  
};
