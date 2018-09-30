//Utility for creating and manipulating 3D vectors

Object.defineProperty(Array.prototype, "x", {
    get: function () {return this[0]},
    set: function (n) {this[0] = n},
});
Object.defineProperty(Array.prototype, "y", {
    get: function () {return this[1]},
    set: function (n) {this[1] = n},
});
Object.defineProperty(Array.prototype, "z", {
    get: function () {return this[2]},
    set: function (n) {this[2] = n},
});


function Vec(x,y,z){
  return {x:x,y:y,z:z}
}

//standard directions
var forward = Vec(0,0,1)
var up = Vec(0,1,0)
var right = Vec(1,0,0)
var zero = Vec(0,0,0)

function fromtuple(tup){
  return Vec(tup[0],tup[1],tup[2])
}

function totuple(v){
  return [v.x,v.y,v.z]
}

// rotate a vector around axis by angle
function rotvec(vec,axis,th){
  var [l,m,n] = [axis.x, axis.y, axis.z]
  var [x,y,z] = [vec.x, vec.y, vec.z]
  var [cos,sin] = [Math.cos(th), Math.sin(th)]

  var mat={}
  mat[11]= l*l *(1-cos) +cos
  mat[12]= m*l *(1-cos) -n*sin
  mat[13]= n*l *(1-cos) +m*sin

  mat[21]= l*m *(1-cos) +n*sin
  mat[22]= m*m *(1-cos) +cos
  mat[23]= n*m *(1-cos) -l*sin

  mat[31]= l*n *(1-cos) -m*sin
  mat[32]= m*n *(1-cos) +l*sin
  mat[33]= n*n *(1-cos) +cos

  return Vec(
    (x*mat[11] + y*mat[12] + z*mat[13]),
    (x*mat[21] + y*mat[22] + z*mat[23]),
    (x*mat[31] + y*mat[32] + z*mat[33]),
  )
}

// rotate vector by euler angles z x y
function roteuler(vec,rot){
  if (rot.z != 0) {vec = rotvec(vec,forward,rot.z)}
  if (rot.x != 0) {vec = rotvec(vec,right,rot.x)}
  if (rot.y != 0) {vec = rotvec(vec,up,rot.y)}
  return vec
}
// scale vector by a factor
function scale(vec,p){
  return Vec(vec.x*p,vec.y*p,vec.z*p)
}

// vector addition
function add(v0,v){
  return Vec(v0.x+v.x,v0.y+v.y,v0.z+v.z)
}

// vector addition
function subtract(v0,v){
  return Vec(v0.x-v.x,v0.y-v.y,v0.z-v.z)
}

// magnitude
function mag(v){
  return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
}

// |v| = 1
function normalize(v){
  var p = 1/mag(v)
  return Vec(v.x*p,v.y*p,v.z*p)
}
function lerp(v0,v1,t){
  return Vec(v0.x*(1-t)+v1.x*t,v0.y*(1-t)+v1.y*t,v0.z*(1-t)+v1.z*t)
}

function dist(v0,v1){
  return Math.sqrt(Math.pow(v0.x-v1.x,2) + Math.pow(v0.y-v1.y,2) + Math.pow(v0.z-v1.z,2))
}

module.exports = {
  Vec:Vec,forward:forward,up:up,right:right,zero:zero,fromtuple:fromtuple,totuple:totuple,
  rotvec:rotvec,roteuler:roteuler,
  scale:scale,add:add,subtract:subtract,mag:mag,normalize:normalize,lerp:lerp,dist:dist,
}
