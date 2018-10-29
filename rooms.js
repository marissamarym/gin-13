var initRoom = {
  box_pickup:function(room_name){
    createRoomIfEmpty(room_name,"box_pickup")
    worlds[room_name] = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 9.8));
    worlds_accessory[room_name] = {"joints":[]}
    createFloorAndWall(worlds[room_name]);
    for (var i = 0; i < 4; i++){
      createBox(worlds[room_name],Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 55+i*5,55+i*5, false);
    }
  },
  collab_canvas:function(room_name){
    createRoomIfEmpty(room_name,"collab_canvas")
    worlds[room_name] = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 9.8));
    createFloorAndWall(worlds[room_name]);
    worlds_accessory[room_name] = {"dots":[]}
  },
  custom_shape:function(room_name){
    createRoomIfEmpty(room_name,"custom_shape")
    worlds[room_name] = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 9.8));
    createFloorAndWall(worlds[room_name]);
    worlds_accessory[room_name] = {"dots":[]}
  },
}

var describeRoom = {
  box_pickup:function(room_name){
    var room = getRoomByName(room_name)
    room.objects = []
    describeBox2DWorld(worlds[room_name],room.objects)
  },
  collab_canvas:function(room_name){
    var room = getRoomByName(room_name)
    room.objects = []
    describeBox2DWorld(worlds[room_name],room.objects)
    room.objects = room.objects.concat(worlds_accessory[room_name]["dots"]);
  },  
  custom_shape:function(room_name){
    var room = getRoomByName(room_name)
    room.objects = []
    describeBox2DWorld(worlds[room_name],room.objects)
    room.objects = room.objects.concat(worlds_accessory[room_name]["dots"]);
  },  
  
  
}

var interact = {
box_pickup:function(room_name){
  cooldown(worlds[room_name]);
  objectPickup(room_name, "leftWrist", "box")
  objectPickup(room_name, "rightWrist", "box")
},
collab_canvas:function(room_name){
  freehand(room_name,"rightWrist");
  
}
}