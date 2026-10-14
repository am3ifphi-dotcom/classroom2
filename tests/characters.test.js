import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DIRECTION,CHARACTER_SPRITE,characterFrameRect,directionFromVector,animationFrame} from '../src/characters.js';

const metadata=JSON.parse(fs.readFileSync(new URL('../public/assets/characters.json',import.meta.url),'utf8'));
test('character atlas and renderer agree on normalised screen-space directions',()=>{
 assert.deepEqual(metadata.directions,['left','up','right','down']);
 assert.deepEqual(metadata.sourceDirections,['right','up','left','down']);
 assert.deepEqual(metadata.sourceBlocks,[2,1,0,3]);
 assert.equal(metadata.frameWidth,CHARACTER_SPRITE.width);
 assert.equal(metadata.frameHeight,CHARACTER_SPRITE.height);
 assert.equal(metadata.framesPerDirection,CHARACTER_SPRITE.frames);
});
test('movement and attack vectors select the correct cardinal direction',()=>{
 for(const [x,y,d] of [[-1,0,DIRECTION.LEFT],[1,0,DIRECTION.RIGHT],[0,-1,DIRECTION.UP],[0,1,DIRECTION.DOWN],[-1,.2,DIRECTION.LEFT],[1,-.3,DIRECTION.RIGHT]])assert.equal(directionFromVector(x,y),d);
});
test('every animation frame stays inside its own facing block',()=>{
 for(let dir=0;dir<4;dir++)for(let phase=0;phase<36;phase+=.125)for(const moving of [true,false]){
  const r=characterFrameRect(dir,phase,moving);
  assert(r.x>=dir*6*32&&r.x+32<=(dir+1)*6*32);
  assert.equal(r.width,32);assert.equal(r.height,48);
 }
});
test('walking preserves six source timing slots; blinking is brief, not a long eye closure',()=>{
 assert.deepEqual([0,1,2,3,4,5].map(p=>animationFrame(p,true)),[0,1,2,3,4,5]);
 assert.equal(animationFrame(5.19,false),3);assert.equal(animationFrame(5.21,false),4);assert.equal(animationFrame(5.48,false),5);
 assert.equal(animationFrame(6,false),0);
});
test('all character PNG sheets have the declared dimensions, not the old 16px frame size',()=>{
 for(const name of metadata.characters)for(const anim of ['run','idle_anim']){
  const b=fs.readFileSync(new URL(`../public/assets/${name}-${anim}.png`,import.meta.url));
  assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),32*24);assert.equal(b.readUInt32BE(20),48);
 }
});
