var points = []; //T1,T2,T3,T4,Tp
var hull = [];

function setup() {
  createCanvas(1200, 800); //canvas na katerega rišemo
  input = createInput(); //vnos x
  input.position(15,850); //kje se nahaja
  button1 = createButton('Even'); //gumb 
  button1.position(15,870);
  button1.mousePressed(even_dist);
  button2 = createButton('Gauss'); //gumb 
  button2.position(15,890);
  button2.mousePressed(gauss_dist);
  button3 = createButton('Jarvis'); //gumb 
  button3.position(15,910);
  button3.mousePressed(generate_hull);
  radio = createRadio();
  radio.option('Jarvis');
  radio.option('Graham');
  radio.option('Quick');
  button3.position(115,870);
}

function create_point(p){ //ustvarimo točko
  points.push(p);
  strokeWeight(10);
  stroke('red');
  point(p.x,p.y);
}

function equals(a, b) {
  return abs(a - b) < 1e-9;
}

function angle(a,b){
  return acos(a.dot(b)/(b.mag()*a.mag()));
}

function euk_dist(a,b){
  return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

function get_min_E(){
  var min = 1200;
  var E,j;
  for (var i = 0; i < points.length; i++ ){
    if(min > points[i].x){
      min = points[i].x;
      E = points[i];
      j = i;
    }
  }
  points.splice(j, 1);
  return E;
}

function get_max_E(){
  var max = 0;
  var E,j;
  for (var i = 0; i < points.length; i++ ){
    if(max < points[i].x){
      max = points[i].x;
      E = points[i];
      j = i;
    }
  }
  points.splice(j, 1);
  return E;
}

function get_S1(){
  var E = get_min_E();
  var j;
  var s1 = points[0];
  var vy = createVector(0,1);
  var minangle = angle(vy,s1);
  for (var i = 1; i < points.length; i++){
    var vs = points[i].copy().sub(E);
    var newangle= angle(vy,vs);
    if(newangle < minangle){
      s1 = points[i];
      j = i;
      minangle = newangle;
    }
    else if(equals(newangle, minangle)){
      if(euk_dist(E,s1) > euk_dist(E,points[i])){
        s1 = points[i];
        j = i;  
      }
    }
  }
  hull.push(E);
  hull.push(s1);
  points.splice(j,1);
  points.push(E);
  return E;
}

function generate_hull(){
  hull = [];
  strokeWeight(2);
  var r = radio.value();
  if(r == 'Jarvis'){
    jarvis_march();
  }
  else if(r == 'Graham'){
    grahams_scan();
  }
  else if(r == 'Quick'){
    quick_hull();
  }
  stroke('black');
  for (var i = 1; i < hull.length; i++){
    line(hull[i-1].x, hull[i-1].y, hull[i].x, hull[i].y);
  }
  line(hull[hull.length-1].x, hull[hull.length-1].y, hull[0].x, hull[0].y)
}

function jarvis_march(){
  var E = get_S1();
  var min = 180;
  var i;
  var A,B;
  while(!hull[hull.length-1].equals(E)){
    min = 180;
    var A = p5.Vector.sub(hull[hull.length-1], hull[hull.length-2]);
    for (var j = 0; j < points.length; j++){
      var B = p5.Vector.sub(points[j], hull[hull.length-1]);
      var ang = angle(A,B);
      if(ang < min){
        i = j;
        min = ang;
      }
    }
    hull.push(points[i].copy());
    points.splice(i,1);
  }
}

function grahangle(a,b){
  var a =atan2(a.x-b.x,a.y-b.y);
  if(a < 0){
    a = a + 2*PI;
  }
  return a;
}

function grahamsort(a,b){
  if(grahangle(b,points[0]) < grahangle(a,points[0])){
    return 1;
  }
  else if(equals(grahangle(b,points[0]),grahangle(a,points[0]))){
    if(euk_dist(points[0],a) > euk_dist(points[0],b)){
      return 1;
    }
  }
  return -1;
}

function grahams_scan(){
  hull = [];
  points.sort((a, b) => (a.x > b.x) ? 1 : -1);
  var temp1 = points.slice(1);
  var temp2 = points.slice(0, 1);
  temp1.sort(grahamsort);
  points = temp2.concat(temp1); 
  hull.push(points[0].copy());
  hull.push(points[1].copy());
  hull.push(points[2].copy());

  for (var i = 3; i < points.length; i++){
    var p1 = hull[hull.length-2].copy();
    var p2 = hull[hull.length-1].copy();
    var p3 = points[i].copy();
    var U = p5.Vector.cross(p3.copy().sub(p1), (p2.copy().sub(p1))).z;
    if(U <= 0){
      while(hull.length > 1 && p5.Vector.cross(points[i].copy().sub(hull[hull.length-2]), ( hull[hull.length-1].copy().sub(hull[hull.length-2]))).z <= 0){
        hull.pop();
      }
    }
    hull.push(p3);
  }
}

function find_hull(s,a,b){
  if (!Array.isArray(s) || !s.length) {
    return;
  }
  var max = (1/2) * abs((a.x - s[0].x) * (b.y - a.y) - (a.x - b.x) * (s[0].y - a.y)); 
  var c = s[0];
  for (let i = 1; i < s.length; i++) {
    var t = (1/2) * abs((a.x - s[i].x) * (b.y - a.y) - (a.x - b.x) * (s[i].y - a.y)); 
    if(max < t){
      max = t;
      c = s[i];
    }
  }
  var j = min(hull.indexOf(a),hull.indexOf(b));
  temp1 = hull.slice(j+1);
  temp2 = hull.slice(0,j+1);
  temp2.push(c.copy());
  hull = temp2.concat(temp1);

  let z1 = [];
  let z2 = [];

  for (let i = 0; i < s.length; i++) {
    var v1 = s[i].copy().sub(a);
    var v2 = c.copy().sub(a);
    let sign = v1.cross(v2).z;
    if(sign < 0){
      z1.push(s[i]);
    }
    else {
      var v1 = s[i].copy().sub(c);
      var v2 = b.copy().sub(c);
      sign = v1.cross(v2).z;
      if(sign < 0){
        z2.push(s[i]);
      }
    }
  }
  
  find_hull(z1,a,c);
  find_hull(z2,c,b);

}

function quick_hull(){
  hull = [];
  var s1 = [];
  var s2 = [];
  var e1 = get_min_E();
  var e2 = get_max_E();
  hull.push(e1.copy());
  hull.push(e2.copy());
  var index = points.indexOf(e1);
  points.splice(index, 1);
  index = points.indexOf(e2);
  points.splice(index, 1);

  for (let i = 0; i < points.length; i++) {
    var v1 = points[i].copy().sub(e1);
    var v2 = e2.copy().sub(e1);
    let sign = v1.cross(v2).z;
    if(sign < 0){
      s1.push(points[i]);
    }
    else if(sign > 0){
      s2.push(points[i]);
    }
  }
  
  find_hull(s1,e1,e2);
  find_hull(s2,e2,e1);

  hull.sort(grahamsort);

}

function gauss_dist(){
  clear();
  points = [];
  var n = input.value();
  for (var i = 0; i < n; i++){
    let x = randomGaussian(600,70);
    let y = randomGaussian(400,70);
    let p = createVector(x,y);
    if (!points.includes(p) && (x<1200 && y < 800)){
      create_point(p);
    }
    else{
      i--;
    }
  }
  console.log(points);
}

function even_dist(){
  clear();
  points = [];
  var n = input.value();
  for (var i = 0; i < n; i++){
    let x = random(200,1000);
    let y = random(100,600);
    let p = createVector(x,y);
    if (!points.includes(p)){
      create_point(p);
    }
    else{
      i--;
    }
  }
}

function draw() {

}
