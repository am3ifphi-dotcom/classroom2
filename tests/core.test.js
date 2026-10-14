import test from 'node:test';import assert from 'node:assert/strict';
import {newProgress,validateSave,readSave,writeSave,statsFor,canHit} from '../src/state.js';
import {collisionRects,circleBlocked,moveWithCollision,PORTALS,RIFTS,NOTES,NPCS} from '../src/world.js';
test('save parser rejects malformed input, bad versions and nonfinite values',()=>{assert.equal(validateSave(null),null);assert.equal(validateSave({version:2}),null);const p=validateSave({version:1,seals:[0,0,1,99,-1,'2'],notes:[1,1,2],essence:Infinity,kills:-5,finished:true});assert.deepEqual(p.seals,[0,1]);assert.deepEqual(p.notes,[1,2]);assert.equal(p.essence,0);assert.equal(p.kills,0);assert.equal(p.finished,false);});
test('save roundtrip and unavailable storage',()=>{const store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};const p=newProgress();p.seals=[0];assert.equal(writeSave(p,storage),true);assert.deepEqual(readSave(storage),p);const bad={getItem(){throw Error('denied')},setItem(){throw Error('quota')}};assert.equal(readSave(bad),null);assert.equal(writeSave(p,bad),false);});
test('progression changes HP, energy, damage and level',()=>{const p=newProgress();assert.deepEqual(statsFor(p),{maxHP:100,maxMP:60,damage:18,level:1});p.seals=[0,1,2];p.notes=[0,1,2];assert.deepEqual(statsFor(p),{maxHP:160,maxMP:90,damage:30,level:4});});
test('melee checks both facing and range',()=>{assert(canHit({x:0,y:0},{x:40,y:0},0));assert(!canHit({x:0,y:0},{x:-40,y:0},0));assert(!canHit({x:0,y:0},{x:100,y:0},0));assert(canHit({x:0,y:0},{x:-40,y:-1},Math.PI));});
test('dash substeps cannot cross furniture or walls',()=>{const p={x:0,y:0};moveWithCollision(p,300,0,[{x:40,y:-20,w:8,h:40}],7);assert(p.x<=33);assert(!circleBlocked(p.x,p.y,7,[{x:40,y:-20,w:8,h:40}]));});
for(let room=0;room<4;room++)test(`room ${room}: every portal, rift, character and note is reachable`,()=>{
 const rect=collisionRects(room),step=8,cols=112,rows=72,start=room===0?[424,352]:room===1?[120,304]:[440,472];
 const queue=[start],seen=new Set([start.join(',')]);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){const xx=x+dx,yy=y+dy,k=`${xx},${yy}`;if(xx<0||yy<0||xx>cols*step||yy>rows*step||seen.has(k)||circleBlocked(xx,yy,7,rect))continue;seen.add(k);queue.push([xx,yy]);}}
 for(const p of [...PORTALS[room],...RIFTS.filter(p=>p.room===room),...NOTES.filter(p=>p.room===room),...NPCS.filter(p=>p.room===room)])assert(queue.some(([x,y])=>Math.hypot(x-p.x,y-p.y)<40),JSON.stringify(p));
});
