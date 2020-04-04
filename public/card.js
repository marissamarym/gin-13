var SUIT = ["diamond","club","heart","spade"]
var RANK = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
var SYMBOLS = {diamond:"♦",club:"♣",heart:"♥",spade:"♠"}
var COLORS = {diamond:"red",club:"black",heart:"red",spade:"black"}
var cards = [];
var CARD_WIDTH = 50;
var CARD_HEIGHT = 70;
var WIDTH = 800;
var HEIGHT = 800;
var DESK_ROT = 0;

const C_S = 250;
const P_S = 150;

const C_LONG = C_S * 2;

var AREA = {
  0:{x:P_S,y:C_LONG + P_S,w:C_LONG,h:P_S},
  1:{x:C_LONG + P_S,y:P_S,w:P_S,h:C_LONG},
  2:{x:P_S,y:  0,w:C_LONG,h:P_S},
  3:{x:  0,y:P_S,w:P_S,h:C_LONG},
  front:{x:P_S,y:P_S,w:C_S,h:C_LONG},
  back: {x:400,y:P_S,w:C_S,h:C_LONG},
}

var mouseDownInfo = {cardId:"",t:0,p0:{x:0,y:0},p1:{x:0,y:0},state:"none"};
var mouseSel = {cards:[]};
var maxZIndex = 0;
var mouseX = 0;
var mouseY = 0;

var card_elts = {}

function randId(){
  return btoa((""+Math.random()).slice(2));
}

function rot90(v){
  var dx = (v.x-WIDTH/2);
  var dy = (v.y-HEIGHT/2);
  return {
    x: WIDTH/2 - dy,
    y: WIDTH/2 + dx, 
  }
}
function unrot90(v){
  var dx = (v.x-WIDTH/2);
  var dy = (v.y-HEIGHT/2);
  return {
    x: WIDTH/2 + dy,
    y: WIDTH/2 - dx, 
  }
}

function desk2screen(v0){
  var v = v0;
  for (var i = 0; i < DESK_ROT; i++){
    v = rot90(v);
  }
  return v;
}

function screen2desk(v0){
  var v = v0;
  for (var i = 0; i < DESK_ROT; i++){
    v = unrot90(v);
  }
  return v;
}


function getCardById(id){
  for (var i = 0; i < cards.length; i++){
    if (cards[i].id == id){
      return cards[i];
    }
  }
}

function corners2rect(mdinfo){
  var sw = Math.abs(mdinfo.p1.x-mdinfo.p0.x);
  var sh = Math.abs(mdinfo.p1.y-mdinfo.p0.y);
  var sx = Math.min(mdinfo.p1.x,mdinfo.p0.x);
  var sy = Math.min(mdinfo.p1.y,mdinfo.p0.y);
  return {x:sx,y:sy,w:sw,h:sh};
}

function inArea(p,area){
  return area.x < p.x && p.x < area.x + area.w
      && area.y < p.y && p.y < area.y + area.h;
}

function visible(p){
  return inArea(p,AREA[DESK_ROT]) || inArea(p,AREA.front);
}


function renderCards(){
  
  maxZIndex = 0;
  for (var i = 0; i < cards.length; i++){
    var elt;
    elt = card_elts[cards[i].id];
    if (elt == undefined){
      //console.log("new");
      elt = document.createElement("div");
      //ele.setAttribute("class","card");
      elt.setAttribute("id",cards[i].id);
      
      if (cards[i].rank != "joker"){
        elt.innerHTML = "<font color="+COLORS[cards[i].suit]+">"+SYMBOLS[cards[i].suit]+"<br>"+cards[i].rank+"</font>";
      }else{
        elt.innerHTML = "<font color="+cards[i].suit+">JK<br>ER</font>";
      }
      
      var closure = function(){
        var closure_id = cards[i].id;
        var onmousedown= function(event){
          mouseDownInfo.cardId = closure_id;
          mouseDownInfo.t = (new Date()).getTime();
        }
        elt.onmousedown = onmousedown;
        elt.ontouchstart = onmousedown;
      }
      closure();
      document.getElementById("desk").appendChild(elt);
      card_elts[cards[i].id] = elt;
    }

    var set_class = "card"
    var issel = mouseSel.cards.indexOf(cards[i]) != -1
    
    if (mouseDownInfo.state != "single" && issel){
      set_class += " card-sel";
    }
    
    var moving = ((mouseDownInfo.state == "multimove" || mouseDownInfo.state == "single") && issel);
    var stopped = (Math.abs(cards[i].targ.x-cards[i].x) < 2) && (Math.abs(cards[i].targ.y-cards[i].y) < 2);
    var vis = visible(cards[i]) && (!moving) && stopped;
    
    if (!vis){
      set_class += " card-back";
      elt.setAttribute("title","");
    }else{
      elt.setAttribute("title",cards[i].suit+"-"+cards[i].rank);
    }

    elt.setAttribute("class",set_class);
    
    var txy = desk2screen(cards[i]);

    elt.style.left = (txy.x-CARD_WIDTH/2)+"px";
    elt.style.top = (txy.y-CARD_HEIGHT/2)+"px";
    elt.style.zIndex = ""+cards[i].z;
    // console.log(cards[i].z);
    maxZIndex = Math.max(maxZIndex, cards[i].z);

  }
  
  var selbox = document.getElementById("selbox");
  var sw = 0, sh = 0, sx = -1000, sy = -1000;
  if (mouseDownInfo.state == "multiselect"){
    selbox.innerHTML = mouseSel.cards.length;
    var ret = corners2rect({
      p0:desk2screen(mouseDownInfo.p0), 
      p1:desk2screen(mouseDownInfo.p1)
    });
    sw = ret.w;
    sh = ret.h;
    sx = ret.x;
    sy = ret.y;
  }else{
    selbox.innerHTML = "";
  }
  
  selbox.style.left = sx + "px";
  selbox.style.top = sy + "px";
  selbox.style.width = sw + "px";
  selbox.style.height = sh + "px";
  
  for (var k in AREA){
    var ab = document.getElementById("areabox-"+k);
    var ret = corners2rect({
      p0:desk2screen(AREA[k]),
      p1:desk2screen({x:AREA[k].x+AREA[k].w, y:AREA[k].y+AREA[k].h})
    })
    ab.style.left = ret.x+"px";
    ab.style.top = ret.y+"px";
    ab.style.width = (ret.w-20)+"px";
    ab.style.height = (ret.h-20)+"px";
  }
  

}
function animateCards(){
  var spd = 0.3
  for (var i = 0; i < cards.length; i++){
    cards[i].x = cards[i].x * (1-spd) + cards[i].targ.x * spd;
    cards[i].y = cards[i].y * (1-spd) + cards[i].targ.y * spd;
    if (cards[i].resolve_dl > 0){
      cards[i].resolve_dl -= 1;
    }
  }
}
function cards2ids(cds){
  var result = []
  for (var i = 0; i < cds.length; i++){
    result.push(cds[i].id);
  }
  return result;
}

function cardResolve(ncards){
  for (var i = 0; i < ncards.length; i++){
    var cd = getCardById(ncards[i].id);
    if (cd == undefined){
      cards.push(ncards[i]);
    }
    else{
      if (mouseSel.cards.indexOf(cd) == -1){
        if (cd.resolve_dl <= 0){
          cd.targ.x = ncards[i].x;
          cd.targ.y = ncards[i].y;
          cd.z = ncards[i].z;
        }
      }
    }
  }
}


function cardMain(commitCallback){
  var commit = function(){
    var targs = [];
    for (var i = 0; i < mouseSel.cards.length; i++){
      var cd = mouseSel.cards[i];
      cd.resolve_dl = 10;
      targs.push({x:cd.targ.x,y:cd.targ.y,z:cd.z});
    }
    commitCallback({cards:cards2ids(mouseSel.cards), targs:targs});
  }
  
  var desk = document.getElementById("desk");
  
  var onmousedown = function(clientX,clientY){
    mouseX = clientX-desk.getBoundingClientRect().left-window.pageXOffset;
    mouseY = clientY-desk.getBoundingClientRect().top-window.pageYOffset;
    var t= (new Date()).getTime();
    
    if (mouseDownInfo.state == "none"){
      if (Math.abs(t - mouseDownInfo.t) < 10){
        if (!mouseSel.cards.length){
          mouseDownInfo.state = "single";
          mouseSel.cards = [getCardById(mouseDownInfo.cardId)];
          mouseSel.cards[0].z = maxZIndex + 1;

        }
      }else{
        if (!mouseSel.cards.length){
          mouseDownInfo.state = "multiselect";
          mouseDownInfo.p0 = screen2desk({x:mouseX,y:mouseY})
          mouseDownInfo.p1 = screen2desk({x:mouseX,y:mouseY})

        }
      }
    }else if (mouseDownInfo.state == "multimove"){
      handhold();
      commit();
      mouseSel.cards = [];
      mouseDownInfo.state = "none";
    }
    //console.log(x+", "+y);
  }
  var handhold = function(){
    var txy = screen2desk({x:mouseX,y:mouseY});
      var area = undefined;
      var aw = 500;
      for (var k in AREA){
        if (inArea(txy,AREA[k])){
          var ret = corners2rect({
            p0:desk2screen(AREA[k]),
            p1:desk2screen({x:AREA[k].x+AREA[k].w, y:AREA[k].y+AREA[k].h})
          })
          aw = ret.w;
          break;
        }
      }

      var spread = Math.min(20*mouseSel.cards.length, aw-CARD_WIDTH);

      for (var i = 0; i < mouseSel.cards.length; i++){

        var dxy = {x:(i/mouseSel.cards.length)*spread-spread/2,y:0};
        dxy.x += WIDTH/2;
        dxy.y += HEIGHT/2;
        dxy = screen2desk(dxy);
        dxy.x -= WIDTH/2;
        dxy.y -= HEIGHT/2;
        mouseSel.cards[i].targ.x = txy.x+dxy.x;
        mouseSel.cards[i].targ.y = txy.y+dxy.y;
        mouseSel.cards[i].targ.x = Math.min(Math.max(mouseSel.cards[i].targ.x,CARD_WIDTH/2),WIDTH-CARD_WIDTH/2);
        mouseSel.cards[i].targ.y = Math.min(Math.max(mouseSel.cards[i].targ.y,CARD_HEIGHT/2),HEIGHT-CARD_HEIGHT/2);
      }
    
  }
  var onmousemove = function(clientX,clientY){
    mouseX = clientX-desk.getBoundingClientRect().left-window.pageXOffset;
    mouseY = clientY-desk.getBoundingClientRect().top-window.pageYOffset;
    if (mouseDownInfo.state == "multiselect"){
      mouseDownInfo.p1 = screen2desk({x:mouseX,y:mouseY})
    
      var ret = corners2rect(mouseDownInfo);

      for (var i = 0; i < cards.length; i++){
        var cx = cards[i].x;
        var cy = cards[i].y;
        var idx = mouseSel.cards.indexOf(cards[i]);
        if (ret.x < cx && cx < ret.x+ret.w &&
            ret.y < cy && cy < ret.y+ret.h){
          if (idx == -1){
            mouseSel.cards.push(cards[i]);
          }
        }else{
          if (idx != -1){
            mouseSel.cards.splice(idx,1);
          }
        }
      }
    }else{
      if (mouseSel.cards.length){
        handhold();
      }
    }
  }
  var onmouseup = function(){
    if (mouseDownInfo.state == "single"){
      commit();
      mouseSel.cards = [];
      mouseDownInfo.state = "none";
    }else if (mouseDownInfo.state == "multiselect"){
      
      for (var i = 0; i < mouseSel.cards.length; i++){
        mouseSel.cards[i].z = maxZIndex+i;
      }
      if (mouseSel.cards.length){
        mouseDownInfo.state = "multimove";
      }else{
        mouseDownInfo.state = "none";
      }
    }
    
  }
  desk.onmousedown = function(event){onmousedown(event.clientX,event.clientY)}
  desk.onmousemove = function(event){onmousemove(event.clientX,event.clientY)}
  desk.onmouseup =   function(event){onmouseup(event.clientX,event.clientY)}
  desk.ontouchstart =function(event){onmousedown(event.touches[0].pageX,event.touches[0].pageY);event.preventDefault();}
  desk.ontouchmove = function(event){onmousemove(event.touches[0].pageX,event.touches[0].pageY);event.preventDefault();}
  desk.ontouchend =  function(event){onmouseup();event.preventDefault();}
  
  function animloop(){
    animateCards();
    window.setInterval(animloop,100);
  }
  function renderloop(){
    renderCards();
    window.setInterval(renderloop,100);
  }
  function loop(){
    animateCards();
    renderCards();
    window.setTimeout(loop,30);
    
  }
  //animloop();
  //renderloop();
  loop()
}
