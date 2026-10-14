import test from 'node:test';
import assert from 'node:assert/strict';
import {PortalTravel,PORTAL_RELEASE_RADIUS,ARRIVAL_COOLDOWN} from '../src/transitions.js';
import {PORTALS,collisionRects,circleBlocked} from '../src/world.js';
import {Game} from '../src/game.js';
import {newProgress} from '../src/state.js';

function gameAtDoor(room,door){
 const g=Object.create(Game.prototype);
 Object.assign(g,{room,mode:'playing',player:{x:door.x,y:door.y,dir:3,angle:0},progress:{...newProgress(),introduced:true,seals:[0]},stage:null,enemies:[],bossStarted:false,portalTravel:new PortalTravel(),camera:{x:0,y:0},vw:640,vh:360,changes:0,messages:[]});
 g.audio={play(){}};
 g.ui={interaction(){},roomChanged(){g.changes++;},banner(){},updateQuest(){},toast(s){g.messages.push(s);}};
 return g;
}

test('old hall spawn cannot bounce back even after cooldown until the entry door is cleared',()=>{
 const door=PORTALS[1][0],travel=new PortalTravel();travel.arrive(door);
 travel.update(10,{x:120,y:300});assert.equal(travel.canUse(door),false);
 travel.update(.01,{x:164,y:300});assert.equal(travel.canUse(door),true);
 travel.arrive(door);travel.update(.1,{x:164,y:300});assert.equal(travel.canUse(door),false);
 travel.update(ARRIVAL_COOLDOWN,{x:164,y:300});assert.equal(travel.canUse(door),true);
});

for(const [room,doors] of PORTALS.entries())for(const [i,door] of doors.entries()){
 test(`portal ${room}:${i}: destination spawn is clear of walls and all portal triggers`,()=>{
  const [x,y]=door.spawn;
  assert.equal(circleBlocked(x,y,7,collisionRects(door.to)),false);
  for(const exit of PORTALS[door.to])assert(Math.hypot(x-exit.x,y-exit.y)>PORTAL_RELEASE_RADIUS,`spawn overlaps ${exit.label}`);
 });
 test(`portal ${room}:${i}: real interact handler crosses once, survives E spam, and allows intentional return`,()=>{
  const g=gameAtDoor(room,door);g.interact();assert.equal(g.room,door.to);assert.equal(g.changes,1);
  for(let n=0;n<12;n++)g.interact();assert.equal(g.room,door.to);assert.equal(g.changes,1);
  g.portalTravel.update(2,g.player);
  for(let n=0;n<5;n++)g.interact();assert.equal(g.room,door.to);assert.equal(g.changes,1);
  const back=PORTALS[g.room].find(p=>p.to===room);assert(back);
  g.player.x=back.x;g.player.y=back.y;g.interact();assert.equal(g.room,room);assert.equal(g.changes,2);
  g.interact();assert.equal(g.room,room);assert.equal(g.changes,2);
 });
}

test('unrepaired classroom and active combat still block leaving without warping',()=>{
 const g=gameAtDoor(0,PORTALS[0][0]);g.progress.seals=[];g.interact();assert.equal(g.room,0);assert.equal(g.changes,0);
 g.progress.seals=[0];g.stage={id:0,wave:1};g.interact();assert.equal(g.room,0);assert.equal(g.changes,0);
 assert(g.messages.some(s=>s.includes('綻び')));assert(g.messages.some(s=>s.includes('影')));
});
