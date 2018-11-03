var SUIT = ["diamond","club","heart","spade"]
var RANK = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
var SYMBOLS = {diamond:"♦",club:"♣",heart:"♥",spade:"♠"}
var COLORS = {diamond:"red",club:"black",heart:"red",spade:"black"}
var cards = [];
var CARD_WIDTH = 50;
var CARD_HEIGHT = 70;
var WIDTH = 800;
var HEIGHT = 800;
var DESK_ROT = 1;
var AREA = {
  0:{x:150,y:650,w:500,h:150},
  1:{x:650,y:150,w:150,h:500},
  2:{x:150,y:  0,w:500,h:150},
  3:{x:  0,y:150,w:150,h:500},
  front:{x:150,y:150,w:250,h:500},
  back: {x:400,y:150,w:250,h:500},
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

function newDeck() {

  var deck = []
  for (var i = 0; i < 4; i++){
    for (var j = 0; j < 13; j++){
      deck.push({
        suit:SUIT[i], 
        rank:RANK[j], 
        x: 0, 
        y: 0,
        targ: {x:Math.random()*800,y:Math.random()*800},
      })
    }
  }
  deck.push({suit:"red",rank:"joker", x: 0, y: 0,
             targ: {x:Math.random()*800,y:Math.random()*800}});
  deck.push({suit:"black",rank:"joker", x: 0, y: 0,
             targ: {x:Math.random()*800,y:Math.random()*800}});
  function makeId(card){
    return card.suit+"-"+card.rank+"-"+randId();
  }
  for (var i = 0; i < deck.length; i++){
    deck[i].targ.x = WIDTH/2+i*1;
    deck[i].targ.y = HEIGHT/2-i*1;
    deck[i].id = makeId(deck[i]);
  }
  
  return deck;
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

function visible(p){
  return AREA[DESK_ROT].x < p.x && p.x < AREA[DESK_ROT].x + AREA[DESK_ROT].w
      && AREA[DESK_ROT].y < p.y && p.y < AREA[DESK_ROT].y + AREA[DESK_ROT].h;
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
        elt.onmousedown = function(event){
          mouseDownInfo.cardId = closure_id;
          mouseDownInfo.t = (new Date()).getTime();
        }
      }
      closure();
      document.getElementById("desk").appendChild(elt);
      card_elts[cards[i].id] = elt;
    }

    var set_class = "card"
    
    if (mouseDownInfo.state != "single" && mouseSel.cards.indexOf(cards[i]) != -1){
      set_class += " card-sel";
    }
    
    if (!visible(cards[i])){
      set_class += " card-back";
    }

    elt.setAttribute("class",set_class);
    
    var txy = desk2screen(cards[i]);

    elt.style.left = (txy.x-CARD_WIDTH/2)+"px";
    elt.style.top = (txy.y-CARD_HEIGHT/2)+"px";
    maxZIndex = Math.max(maxZIndex, Number(elt.style.zIndex));

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
  }
}



function cardMain(){
  var desk = document.getElementById("desk");
  desk.onmousedown = function(event){
    mouseX = event.clientX-desk.getBoundingClientRect().left;
    mouseY = event.clientY-desk.getBoundingClientRect().top;
    var t= (new Date()).getTime();
    
    if (mouseDownInfo.state == "none"){
      if (Math.abs(t - mouseDownInfo.t) < 10){
        if (!mouseSel.cards.length){
          mouseDownInfo.state = "single";
          mouseSel.cards = [getCardById(mouseDownInfo.cardId)];
          document.getElementById(mouseDownInfo.cardId).style.zIndex = ""+(maxZIndex+1);
        }
      }else{
        if (!mouseSel.cards.length){
          mouseDownInfo.state = "multiselect";
          mouseDownInfo.p0 = screen2desk({x:mouseX,y:mouseY})
          mouseDownInfo.p1 = screen2desk({x:mouseX,y:mouseY})

        }
      }
    }else if (mouseDownInfo.state == "multimove"){
      mouseSel.cards = [];
      mouseDownInfo.state = "none";
    }
    //console.log(x+", "+y);
  }
  desk.onmousemove = function(event){
    mouseX = event.clientX-desk.getBoundingClientRect().left;
    mouseY = event.clientY-desk.getBoundingClientRect().top;
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
        var spread = Math.min(20*mouseSel.cards.length, 500);

        for (var i = 0; i < mouseSel.cards.length; i++){
          var txy = screen2desk({x:mouseX,y:mouseY});
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
    }
  }
  desk.onmouseup = function(event){
    if (mouseDownInfo.state == "single"){
      mouseSel.cards = [];
      mouseDownInfo.state = "none";
    }else if (mouseDownInfo.state == "multiselect"){
      for (var i = 0; i < mouseSel.cards.length; i++){
        document.getElementById(mouseSel.cards[i].id).style.zIndex = maxZIndex + i;
      }
      if (mouseSel.cards.length){
        mouseDownInfo.state = "multimove";
      }else{
        mouseDownInfo.state = "none";
      }
    }
    
  }
  
  cards = newDeck()//.concat(newDeck());
  
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
