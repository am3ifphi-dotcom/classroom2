import {PortalTravel,PORTAL_RADIUS} from './transitions.js';
import {DIRECTION,CHARACTER_SPRITE,characterFrameRect,directionFromVector} from './characters.js';
import {ROOM_INFO,PORTALS,RIFTS,NPCS,NOTES,OBJECTS,WORLD_W,WORLD_H,roomObjects,collisionRects,moveWithCollision,makeRoomBackground,drawObject,circleBlocked} from './world.js';
import {newProgress,statsFor,clamp,distance,canHit} from './state.js';
import {OPENING,SEAL_LINES,BOSS_INTRO,ENDING,MIE_REPEAT,REI_REPEAT} from './story.js';
const TAU=Math.PI*2;
export class Game{
 constructor(canvas,images,audio,ui){
  this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.images=images;this.audio=audio;this.ui=ui;
  this.portalTravel=new PortalTravel();this.progress=newProgress();this.mode='title';this.room=0;this.player=this.newPlayer();this.camera={x:0,y:0};this.keys=new Set();this.stick={x:0,y:0};this.pointer=null;this.attacking=false;
  this.time=0;this.activeTime=0;this.stepClock=0;this.shake=0;this.flash=0;this.hitstop=0;this.transition=0;this.stage=null;this.bossStarted=false;
  this.enemies=[];this.bullets=[];this.particles=[];this.effects=[];this.swings=[];this.floaters=[];this.drops=[];this.telegraphs=[];this.trails=[];
  this.settings={shake:true,particles:true,volume:.45};this.mapObjects=ROOM_INFO.map((_,i)=>roomObjects(i));this.collisions=ROOM_INFO.map((_,i)=>collisionRects(i));this.backgrounds=ROOM_INFO.map((_,i)=>makeRoomBackground(i,images));
  this.motes=Array.from({length:90},()=>({x:Math.random()*896,y:Math.random()*576,r:Math.random()>.8?1.3:.6,s:Math.random()*3+1,p:Math.random()*TAU}));
  this.resize();this.camera.x=clamp(385-this.vw/2,0,Math.max(0,WORLD_W-this.vw));this.camera.y=clamp(266-this.vh/2,0,Math.max(0,WORLD_H-this.vh));
  this.last=performance.now();this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);
 }
 newPlayer(){const s=statsFor(this.progress||newProgress());return {x:425,y:354,dir:3,angle:Math.PI/2,anim:0,moving:false,hp:s.maxHP,mp:s.maxMP,potions:3,attackCd:0,castCd:0,dashCd:0,dashTime:0,inv:0,combo:0,comboTime:0,dx:0,dy:1,healCd:0,...s};}
 resize(){this.zoom=Math.max(1.3,Math.min(innerHeight/480,3));if(innerWidth<700&&innerHeight>innerWidth)this.zoom=2.05;this.canvas.width=Math.ceil(innerWidth/this.zoom);this.canvas.height=Math.ceil(innerHeight/this.zoom);this.vw=this.canvas.width;this.vh=this.canvas.height;this.ctx.imageSmoothingEnabled=false;}
 start(progress){this.portalTravel.reset();this.progress=progress||newProgress();this.player=this.newPlayer();this.room=0;this.stage=null;this.bossStarted=false;this.clearEncounter();this.mode='playing';this.activeTime=this.progress.seconds;this.audio.unlock();this.ui.onStart();this.audio.playMusic('music-connected');this.ui.updateQuest();if(!this.progress.introduced){this.ui.dialogue(OPENING,()=>{this.progress.introduced=true;this.ui.save();this.ui.banner('帰れない放課後','三つの綻びを、ほどく。');});}else{this.ui.banner('理数科 1年B組','記録した放課後から、もう一度。');}this.updateHUD();}
 clearEncounter(){this.enemies=[];this.bullets=[];this.effects=[];this.drops=[];this.telegraphs=[];this.trails=[];this.swings=[];this.floaters=[];this.particles=[];this.attacking=false;}
 changeRoom(id,spawn){
  if(this.stage||this.enemies.some(e=>e.boss)){this.ui.toast('影を鎮めるまで、この境界は越えられない');return;}
  const previousRoom=this.room;
  this.clearEncounter();this.room=id;[this.player.x,this.player.y]=spawn;
  const entryDoor=PORTALS[id].filter(p=>p.to===previousRoom).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];
  this.portalTravel.arrive(entryDoor);
  // Face into the destination room, not back at the door we just crossed.
  if(entryDoor){this.player.angle=Math.atan2(this.player.y-entryDoor.y,this.player.x-entryDoor.x);this.faceAngle(this.player.angle);}
  this.player.inv=1;this.player.dashTime=0;this.player.moving=false;
  this.camera.x=clamp(this.player.x-this.vw*.566,0,Math.max(0,WORLD_W-this.vw));this.camera.y=clamp(this.player.y-this.vh*.65,0,Math.max(0,WORLD_H-this.vh));
  this.transition=1;this.ui.interaction(null);this.audio.play('door',.55);this.ui.roomChanged();this.ui.banner(ROOM_INFO[id].name,ROOM_INFO[id].subtitle);this.ui.updateQuest();
 }

 nearest(){
  const p=this.player;let list=[];
  for(const n of NPCS)if(n.room===this.room)list.push({...n,kind:'npc',label:n.name+'と話す'});
  for(const n of NOTES)if(n.room===this.room&&!this.progress.notes.includes(n.id))list.push({...n,kind:'note',label:'記録を読む'});
  for(const n of PORTALS[this.room])if(this.portalTravel.canUse(n))list.push({...n,kind:'portal'});
  RIFTS.forEach((r,id)=>{if(r.room===this.room&&!this.progress.seals.includes(id)&&!this.stage)list.push({...r,id,kind:'rift',label:'綻びに触れる'});});
  if(this.room===1&&this.progress.seals.length===3&&!this.bossStarted)list.push({x:475,y:300,kind:'boss',label:'最後の境界を越える'});
  return list.filter(n=>distance(n,p)<(n.kind==='portal'?PORTAL_RADIUS:48)).sort((a,b)=>distance(a,p)-distance(b,p))[0]||null;
 }
 interact(){
  if(this.mode==='dialogue'){this.ui.nextDialogue();return;}if(this.mode!=='playing'||this.portalTravel.remaining>0)return;
  const n=this.nearest();if(!n){this.ui.toast('光や人物の近くで E：調べる');return;}
  if(n.kind==='portal'){if(this.room===0&&!this.progress.seals.includes(0)){this.ui.toast('まずは黒板の前の綻びを調べよう');return;}this.changeRoom(n.to,n.spawn);return;}
  if(n.kind==='npc'){
   if(this.stage){this.ui.toast('まずは教室の影を鎮めよう');return;}
   if(n.id==='mie'&&this.player.hp<this.player.maxHP){this.player.hp=this.player.maxHP;this.particleBurst(n.x,n.y,18,'#a9ddbf');this.ui.toast('三重の差し入れ · HP全回復');}
   this.ui.dialogue(n.id==='mie'?MIE_REPEAT:REI_REPEAT);return;
  }
  if(n.kind==='note'){this.progress.notes.push(n.id);const st=statsFor(this.progress);Object.assign(this.player,st);this.player.hp=Math.min(this.player.hp+15,st.maxHP);this.progress.essence+=10;this.audio.play('open',.7);this.ui.dialogue([['ryoma',n.text],['rei','記録しておこう。見つけたものは、なくならないように。　【最大HP +5 / 残響 +10】']],()=>this.ui.save());return;}
  if(n.kind==='rift')this.beginRift(n.id);
  if(n.kind==='boss')this.ui.dialogue(BOSS_INTRO,()=>this.beginBoss());
 }
 beginRift(id){this.stage={id,wave:0,wait:0};this.audio.play('cast',.5);this.ui.toast('綻びが開いた ── 影を鎮める');this.spawnWave();this.ui.updateQuest();}
 spawnWave(){const st=this.stage;st.wave++;const r=RIFTS[st.id];const count=st.wave===1?3+st.id:4+st.id;
  for(let i=0;i<count;i++){const angle=i/count*TAU+st.wave;let x=r.x+Math.cos(angle)*110,y=r.y+88+Math.sin(angle)*60;const point=this.findFree(x,y);this.spawnEnemy(point.x,point.y,(i+st.wave)%3===0?'caster':'shade');}
  this.ui.toast(`第 ${st.wave} 波 / 2　 ·　${count} 体の残響`);this.shake=2;
 }
 findFree(x,y){const rect=this.collisions[this.room];for(let i=0;i<80;i++){const a=i*.7,r=i*2;const xx=clamp(x+Math.cos(a)*r,100,790),yy=clamp(y+Math.sin(a)*r,140,510);if(!circleBlocked(xx,yy,10,rect)&&distance({x:xx,y:yy},this.player)>55)return{x:xx,y:yy};}return {x:440,y:270};}
 spawnEnemy(x,y,type='shade'){const boss=type==='boss',caster=type==='caster';const hp=boss?520:caster?60+this.progress.seals.length*6:44+this.progress.seals.length*5;this.enemies.push({x,y,type,boss,radius:boss?22:9,hp,maxHP:hp,speed:boss?24:caster?24:35+this.progress.seals.length*3,timer:boss?1.8:.7+Math.random(),windup:0,anim:Math.random()*5,hit:0,spawn:1,target:null,phase:0,attackIndex:0});this.particleBurst(x,y-10,20,'#b09ccf');}
 finishRift(){const id=this.stage.id;this.stage=null;this.bullets=[];this.telegraphs=[];this.progress.seals.push(id);this.progress.essence+=50;const st=statsFor(this.progress);Object.assign(this.player,st);this.player.hp=st.maxHP;this.player.mp=st.maxMP;this.player.potions=Math.min(3,this.player.potions+1);this.player.inv=1;const r=RIFTS[id];this.particleBurst(r.x,r.y,70,'#f4d59a');this.effects.push({x:r.x,y:r.y,age:0,scale:4});this.audio.play('seal',.8);this.shake=4;this.ui.save();this.ui.updateQuest();this.ui.banner('綻びを修復した',`共鳴レベル ${st.level}　 ·　最大HP +15`);this.ui.dialogue(SEAL_LINES[id]);}
 beginBoss(){this.bossStarted=true;this.spawnEnemy(475,284,'boss');this.audio.playMusic('music-rumble_at_the_gates');this.ui.banner('名もない放課後','THE UNDEFINED');this.ui.updateQuest();}
 attack(){
  const p=this.player;if(this.mode!=='playing'||p.attackCd>0||p.dashTime>0)return;
  if(this.pointer){const target={x:this.pointer.x/this.zoom+this.camera.x,y:this.pointer.y/this.zoom+this.camera.y};if(distance(p,target)>12)p.angle=Math.atan2(target.y-p.y,target.x-p.x);}
  else {const near=this.enemies.filter(e=>distance(e,p)<80).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(near)p.angle=Math.atan2(near.y-p.y,near.x-p.x);}
  p.combo=p.comboTime>0?(p.combo+1)%3:0;p.comboTime=.8;p.attackCd=p.combo===2?.42:.28;
  this.faceAngle(p.angle);this.swings.push({x:p.x,y:p.y-10,angle:p.angle,age:0,heavy:p.combo===2});this.audio.play('attack',.6);
  let hit=false;for(const e of this.enemies){if(e.hp>0&&canHit(p,e,p.angle,51+(p.combo===2?7:0))){this.damageEnemy(e,p.damage+(p.combo===2?14:p.combo===1?4:0),p.angle,26);hit=true;}}
  if(hit){this.hitstop=.045;this.shake=p.combo===2?3:1.6;}
 }
 faceAngle(a){this.player.dir=directionFromVector(Math.cos(a),Math.sin(a));}
 dash(){const p=this.player;if(this.mode!=='playing'||p.dashCd>0||p.dashTime>0)return;let {x,y}=this.movementInput();const len=Math.hypot(x,y);if(len<.05){x=Math.cos(p.angle);y=Math.sin(p.angle);}else{x/=len;y/=len;}p.dx=x;p.dy=y;p.angle=Math.atan2(y,x);this.faceAngle(p.angle);p.dashTime=.21;p.dashCd=.82;p.inv=.29;this.audio.play('dash',.8);this.particleBurst(p.x,p.y,7,'#c8d9e6');}
 cast(){const p=this.player;if(this.mode!=='playing'||p.castCd>0)return;if(p.mp<25){this.ui.toast('本質共鳴が足りない · 時間で回復');return;}p.mp-=25;p.castCd=2.3;p.inv=.25;this.audio.play('cast',.65);this.shake=4;this.flash=.16;
  const target=this.enemies.filter(e=>e.hp>0&&distance(e,p)<205).sort((a,b)=>distance(a,p)-distance(b,p))[0];const x=target?target.x:p.x+Math.cos(p.angle)*57,y=target?target.y:p.y+Math.sin(p.angle)*57;
  this.effects.push({x,y,age:0,scale:5,ring:true});this.particleBurst(x,y,55,'#e0bfef');
  for(const e of this.enemies){if(distance(e,{x,y})<95||distance(e,p)<60)this.damageEnemy(e,48+this.progress.seals.length*9,Math.atan2(e.y-p.y,e.x-p.x),40);}
  this.bullets=this.bullets.filter(b=>b.friendly||distance(b,{x,y})>125);this.floaters.push({x:p.x,y:p.y-55,text:'✝ 本質解放 ✝',color:'#ebcff3',age:0});
 }
 heal(){const p=this.player;if(this.mode!=='playing'||p.healCd>0)return;if(p.hp>=p.maxHP){this.ui.toast('HPは満タンです');return;}if(!p.potions){this.ui.toast('ラムネがない · 教室の三重に相談しよう');return;}p.potions--;p.healCd=1;p.hp=Math.min(p.maxHP,p.hp+65);this.audio.play('seal',.45);this.particleBurst(p.x,p.y,28,'#afd7b6');this.floaters.push({x:p.x,y:p.y-38,text:'+65 HP',color:'#b8e5b7',age:0});}
 damageEnemy(e,amount,angle,knock){if(e.hp<=0||e.spawn>.65)return;e.hp-=amount;e.hit=.14;e.windup=0;this.audio.play('hit',.19);this.floaters.push({x:e.x+(Math.random()-.5)*10,y:e.y-30,text:String(amount),color:amount>30?'#efd096':'#f2eade',age:0});this.particleBurst(e.x,e.y-12,8,'#c9b2e6');this.effects.push({x:e.x,y:e.y-12,age:0,scale:1.7,kind:'impact'});if(!e.boss)moveWithCollision(e,Math.cos(angle)*knock,Math.sin(angle)*knock,this.collisions[this.room],e.radius);if(e.hp<=0)this.killEnemy(e);}
 killEnemy(e){this.progress.kills++;this.progress.essence+=e.boss?100:5;this.effects.push({x:e.x,y:e.y-12,age:0,scale:e.boss?6:2.3});this.particleBurst(e.x,e.y-12,e.boss?70:18,'#c8a9e6');for(let i=0;i<3;i++)this.drops.push({x:e.x+(Math.random()-.5)*24,y:e.y+(Math.random()-.5)*24,age:0,heal:i===0});
  if(e.boss){this.bullets=[];this.telegraphs=[];this.shake=8;this.flash=.3;this.audio.playMusic('music-moon');this.progress.finished=true;this.ui.save();this.ui.dialogue(ENDING,()=>{this.mode='ending';this.ui.ending(true);});}
 }
 hurt(amount,x,y){const p=this.player;if(p.inv>0||this.mode!=='playing')return;p.hp=Math.max(0,p.hp-amount);p.inv=.9;this.shake=5;this.flash=-.25;this.audio.play('hurt',.6);const a=Math.atan2(p.y-y,p.x-x);moveWithCollision(p,Math.cos(a)*15,Math.sin(a)*15,this.collisions[this.room]);this.floaters.push({x:p.x,y:p.y-36,text:'−'+amount,color:'#f0a29e',age:0});this.particleBurst(p.x,p.y-12,15,'#d9898c');if(p.hp<=0){this.mode='dead';this.audio.playMusic('music-moon');this.ui.ending(false);}}
 movementInput(){let x=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))+this.stick.x,y=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'))+this.stick.y;
  const gp=navigator.getGamepads?.()[0];if(gp){x+=Math.abs(gp.axes[0])>.2?gp.axes[0]:0;y+=Math.abs(gp.axes[1])>.2?gp.axes[1]:0;}return{x,y};}
 frame(now){const dt=Math.min((now-this.last)/1000,.12);this.last=now;if(!document.hidden){this.time+=dt;this.audio.update(dt,this.mode==='menu'||this.mode==='dialogue');if(this.hitstop>0)this.hitstop-=dt;else if(this.mode==='playing'){const steps=Math.max(1,Math.ceil(dt/(1/60)));for(let i=0;i<steps&&this.mode==='playing';i++)this.update(dt/steps);}this.updateVisual(dt);this.render();this.hudClock=(this.hudClock||0)+dt;if(this.hudClock>(this.mode==='dialogue'?.04:.10)){this.hudClock=0;this.updateHUD();}}requestAnimationFrame(this.frame);}

 update(dt){
  const p=this.player;this.activeTime+=dt;this.progress.seconds=Math.floor(this.activeTime);
  for(const key of ['attackCd','castCd','dashCd','inv','comboTime','healCd'])p[key]=Math.max(0,p[key]-dt);p.mp=Math.min(p.maxMP,p.mp+6*dt);
  let {x,y}=this.movementInput();const len=Math.hypot(x,y);const wasMoving=p.moving;p.moving=len>.08;if(wasMoving!==p.moving)p.anim=0;
  if(p.dashTime>0){p.dashTime=Math.max(0,p.dashTime-dt);moveWithCollision(p,p.dx*340*dt,p.dy*340*dt,this.collisions[this.room]);this.trails.push({x:p.x,y:p.y,dir:p.dir,anim:p.anim,age:0});}
  else if(p.moving){x/=Math.max(1,len);y/=Math.max(1,len);p.angle=Math.atan2(y,x);this.faceAngle(p.angle);moveWithCollision(p,x*88*dt,y*88*dt,this.collisions[this.room]);p.anim+=dt*10;this.stepClock+=dt;if(this.stepClock>.27){this.stepClock=0;this.audio.play('step',.10);}}
  else{p.anim+=dt*3;this.stepClock=.15;}
  if(this.attacking||this.keys.has('KeyJ'))this.attack();
  for(const e of this.enemies){if(e.hp<=0)continue;e.anim+=dt*6;e.hit=Math.max(0,e.hit-dt);e.spawn=Math.max(0,e.spawn-dt);if(e.spawn>.2)continue;const d=distance(e,p);const a=Math.atan2(p.y-e.y,p.x-e.x);e.timer-=dt;
   if(e.boss){this.updateBoss(e,dt);continue;}
   if(e.windup>0){e.windup-=dt;if(e.windup<=0){if(e.type==='caster'){this.fire(e.x,e.y-9,e.aim,76,11);this.audio.play('cast',.12);}else if(distance(e,p)<35)this.hurt(12,e.x,e.y);e.timer=e.type==='caster'?1.7:1.1;}continue;}
   if(e.type==='caster'){
    if(d>185)moveWithCollision(e,Math.cos(a)*e.speed*dt,Math.sin(a)*e.speed*dt,this.collisions[this.room],e.radius);
    if(d<82)moveWithCollision(e,-Math.cos(a)*e.speed*dt,-Math.sin(a)*e.speed*dt,this.collisions[this.room],e.radius);
    if(e.timer<=0){e.windup=.65;e.aim=a;}
   }else{
    if(d>22){const xx=e.x,yy=e.y;moveWithCollision(e,Math.cos(a)*e.speed*dt,Math.sin(a)*e.speed*dt,this.collisions[this.room],e.radius);if(Math.hypot(e.x-xx,e.y-yy)<e.speed*dt*.45){const side=Math.sin(e.anim*.3)>0?1:-1;moveWithCollision(e,Math.cos(a+side*1.25)*e.speed*dt,Math.sin(a+side*1.25)*e.speed*dt,this.collisions[this.room],e.radius);}}
    if(d<30&&e.timer<=0)e.windup=.48;
   }
  }
  this.enemies=this.enemies.filter(e=>e.hp>0);
  for(let i=0;i<this.enemies.length;i++)for(let j=i+1;j<this.enemies.length;j++){const a=this.enemies[i],b=this.enemies[j],d=distance(a,b);if(d<20&&d>.1&&!a.boss&&!b.boss){const push=(20-d)*.04;moveWithCollision(a,(a.x-b.x)/d*push,(a.y-b.y)/d*push,this.collisions[this.room],a.radius);}}
  for(const b of this.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.age+=dt;if(distance(b,p)<b.radius+7){this.hurt(b.damage,b.x,b.y);b.age=10;}if(b.x<78||b.x>824||b.y<116||b.y>535)b.age=10;}
  this.bullets=this.bullets.filter(b=>b.age<6);
  for(const t of this.telegraphs){t.age+=dt;if(t.age>=t.delay&&!t.fired){t.fired=true;this.effects.push({x:t.x,y:t.y,age:0,scale:3});this.particleBurst(t.x,t.y,16,'#c59bd3');if(distance(t,p)<t.r+5)this.hurt(19,t.x,t.y);}}
  this.telegraphs=this.telegraphs.filter(t=>t.age<t.delay+.5);
  for(const d of this.drops){d.age+=dt;const len=distance(d,p);if(len<110){d.x+=(p.x-d.x)*dt*6;d.y+=(p.y-d.y)*dt*6;}if(len<12){if(d.heal)p.hp=Math.min(p.maxHP,p.hp+3);p.mp=Math.min(p.maxMP,p.mp+2);d.age=20;}}
  this.drops=this.drops.filter(d=>d.age<12);
  if(this.stage&&this.enemies.length===0){this.stage.wait+=dt;if(this.stage.wait>1.25){if(this.stage.wave<2){this.stage.wait=0;this.spawnWave();}else this.finishRift();}}
  const gp=navigator.getGamepads?.()[0];if(gp){if(gp.buttons[0]?.pressed)this.dash();if(gp.buttons[2]?.pressed)this.attack();if(gp.buttons[3]?.pressed)this.cast();}
  this.portalTravel.update(dt,p);
  this.ui.interaction(this.nearest());
 }
 updateBoss(e,dt){const p=this.player;const d=distance(e,p),a=Math.atan2(p.y-e.y,p.x-e.x);if(d>120)moveWithCollision(e,Math.cos(a)*e.speed*dt,Math.sin(a)*e.speed*dt,this.collisions[this.room],e.radius);
  if(e.hp<e.maxHP*.5&&!e.phase){e.phase=1;e.timer=.6;this.ui.toast('境界が反転する ── 予兆の外へ');this.particleBurst(e.x,e.y,50,'#f0b7da');}
  if(e.windup>0){e.windup-=dt;if(e.windup<=0){const count=e.phase?14:10;for(let i=0;i<count;i++)this.fire(e.x,e.y-10,i/count*TAU+e.attackIndex*.3,e.phase?89:69,14);this.audio.play('cast',.4);e.timer=e.phase?1.3:2;}return;}
  if(e.timer<=0){e.attackIndex++;if(e.attackIndex%2===0){e.windup=.9;}else{for(let i=0;i<(e.phase?4:2);i++){const tx=clamp(p.x+(Math.random()-.5)*90,105,800),ty=clamp(p.y+(Math.random()-.5)*75,145,510);this.telegraphs.push({x:tx,y:ty,r:31,age:0,delay:1.1,fired:false});}e.timer=e.phase?1.8:2.5;}}
  if(d<32)this.hurt(17,e.x,e.y);
 }
 fire(x,y,a,speed,damage){this.bullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,age:0,damage,radius:4});}
 particleBurst(x,y,n,color){n=this.settings.particles?n:Math.ceil(n*.3);for(let i=0;i<n;i++){const a=Math.random()*TAU,s=Math.random()*45+10;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-15,life:.3+Math.random()*.6,max:1,color,size:Math.random()>.8?2:1});}if(this.particles.length>400)this.particles.splice(0,this.particles.length-400);}
 updateVisual(dt){this.shake=Math.max(0,this.shake-dt*14);this.transition=Math.max(0,this.transition-dt*2.1);this.flash*=Math.max(0,1-dt*7);
  if(!['menu','dead','ending'].includes(this.mode)){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);for(const a of [this.effects,this.swings,this.floaters,this.trails])for(const e of a)e.age+=dt;this.effects=this.effects.filter(e=>e.age<.8);this.swings=this.swings.filter(e=>e.age<.23);this.floaters=this.floaters.filter(e=>e.age<.9);this.trails=this.trails.filter(e=>e.age<.24);}
  if(this.mode!=='title'){const tx=clamp(this.player.x-this.vw*.56,0,Math.max(0,WORLD_W-this.vw)),ty=clamp(this.player.y-this.vh*.65,0,Math.max(0,WORLD_H-this.vh));const rate=1-Math.exp(-dt*5);this.camera.x+=(tx-this.camera.x)*rate;this.camera.y+=(ty-this.camera.y)*rate;}
 }
 render(){const g=this.ctx;g.setTransform(1,0,0,1,0,0);g.fillStyle='#262d3a';g.fillRect(0,0,this.vw,this.vh);g.imageSmoothingEnabled=false;
  const shake=this.settings.shake?this.shake:0;const cx=Math.round(this.camera.x+(Math.random()-.5)*shake),cy=Math.round(this.camera.y+(Math.random()-.5)*shake);g.save();g.translate(-cx,-cy);g.drawImage(this.backgrounds[this.room],0,0);
  // Off-map overscan remains filled with the same surface on ultrawide displays.
  if(this.vw>WORLD_W){for(let x=WORLD_W;x<this.vw;x+=WORLD_W)g.drawImage(this.backgrounds[this.room],x,0);}
  this.drawLight(g,false);
  for(let i=0;i<RIFTS.length;i++){const r=RIFTS[i];if(r.room===this.room)this.drawRift(g,r.x,r.y,this.progress.seals.includes(i),this.stage?.id===i);}
  if(this.room===1&&this.progress.seals.length===3&&!this.progress.finished&&!this.bossStarted)this.drawRift(g,475,300,false,true,1.4);
  for(const t of this.telegraphs){g.strokeStyle=t.fired?'#dda7e2':'#e08aa6';g.lineWidth=1;g.globalAlpha=t.fired?.4:1;g.beginPath();g.ellipse(t.x,t.y,t.r,t.r*.55,0,0,TAU);g.stroke();g.fillStyle=t.fired?'#c19bc74d':'#b343731f';g.fill();if(!t.fired){g.beginPath();g.ellipse(t.x,t.y,t.r*clamp(t.age/t.delay,0,1),t.r*.55*clamp(t.age/t.delay,0,1),0,0,TAU);g.stroke();}g.globalAlpha=1;}
  for(const d of this.drops){g.save();g.translate(d.x,d.y-4-Math.sin(this.time*4+d.x)*2);g.rotate(Math.PI/4);g.fillStyle=d.heal?'#a8d7b0':'#d7b5ed';g.shadowColor=g.fillStyle;g.shadowBlur=8;g.fillRect(-1.5,-1.5,3,3);g.restore();}
  for(const t of this.trails){g.globalAlpha=(1-t.age/.24)*.22;this.drawCharacter(g,t.x,t.y,'ryoma',t.dir,t.anim,true,false);g.globalAlpha=1;}
  const layer=[];for(const o of this.mapObjects[this.room].filter(o=>o.solid)){const h=OBJECTS[o.kind][3];layer.push({y:o.y+h*o.s*.9,draw:()=>drawObject(g,this.images.interior,o)});}
  for(const n of NPCS.filter(n=>n.room===this.room))layer.push({y:n.y,draw:()=>this.drawCharacter(g,n.x,n.y,n.id,distance(n,this.player)<105?directionFromVector(this.player.x-n.x,this.player.y-n.y):DIRECTION.DOWN,this.time*3,false)});
  layer.push({y:this.player.y,draw:()=>this.drawPlayer(g)});
  for(const e of this.enemies)layer.push({y:e.y,draw:()=>this.drawEnemy(g,e)});
  layer.sort((a,b)=>a.y-b.y);for(const l of layer)l.draw();
  for(const n of NPCS.filter(n=>n.room===this.room)){if(this.stage)continue;this.drawMarker(g,n.x,n.y-54,n.id==='mie'?'···':'◇','#dbccaa');}
  for(const n of NOTES.filter(n=>n.room===this.room&&!this.progress.notes.includes(n.id)))this.drawMarker(g,n.x,n.y-10,'✧','#e4ce96');
  for(const portal of PORTALS[this.room]){this.drawPortal(g,portal);}
  for(const s of this.swings){g.save();g.translate(s.x,s.y);g.rotate(s.angle);const k=s.age/.23;g.globalAlpha=1-k;g.strokeStyle=s.heavy?'#f4dcac':'#f0e8d3';g.lineWidth=s.heavy?5:3;g.beginPath();g.ellipse(0,0,42+k*8,28+k*8,0,-1.4+k*.7,1.4+k*.7);g.stroke();g.lineWidth=1;g.strokeStyle='#f8fcff';g.beginPath();g.ellipse(0,0,48+k*8,32+k*8,0,-1.2+k*.7,1.2+k*.7);g.stroke();g.restore();}
  for(const b of this.bullets){this.glow(g,b.x,b.y,14,'#c293dc',.27);g.fillStyle='#eed3fa';g.fillRect(Math.round(b.x)-2,Math.round(b.y)-2,4,4);g.fillStyle='#a886c4';g.fillRect(Math.round(b.x-b.vx*.04)-1,Math.round(b.y-b.vy*.04)-1,2,2);}
  for(const e of this.effects){const f=Math.min(39,Math.floor(e.age*50));g.save();g.globalCompositeOperation='screen';const s=32*e.scale;if(e.kind==='impact'){if(e.age<.32)g.drawImage(this.images.impact,Math.min(7,Math.floor(e.age*25))*32,0,32,32,e.x-s/2,e.y-s/2,s,s);}else g.drawImage(this.images.dissolve,(f%8)*32,Math.floor(f/8)*32,32,32,e.x-s/2,e.y-s/2,s,s);if(e.ring){g.strokeStyle='#e2bce4';g.globalAlpha=Math.max(0,1-e.age*2);g.lineWidth=2;g.beginPath();g.ellipse(e.x,e.y,100*e.age+15,60*e.age+10,0,0,TAU);g.stroke();}g.restore();}
  for(const p of this.particles){g.globalAlpha=Math.min(1,p.life*2);g.fillStyle=p.color;g.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);}g.globalAlpha=1;
  this.drawLight(g,true);
  for(const f of this.floaters){g.globalAlpha=Math.min(1,(.9-f.age)*3);g.font=(f.text.length>6?'8':'11')+'px "Noto Sans JP"';g.textAlign='center';g.fillStyle='#202034';g.fillText(f.text,Math.round(f.x)+1,Math.round(f.y-f.age*28)+1);g.fillStyle=f.color;g.fillText(f.text,Math.round(f.x),Math.round(f.y-f.age*28));g.textAlign='left';}g.globalAlpha=1;g.restore();
  if(this.transition>0){g.fillStyle=`rgba(13,20,32,${this.transition})`;g.fillRect(0,0,this.vw,this.vh);}if(Math.abs(this.flash)>.01){g.fillStyle=this.flash>0?`rgba(224,197,245,${this.flash})`:`rgba(162,36,59,${-this.flash})`;g.fillRect(0,0,this.vw,this.vh);}
 }
 drawCharacter(g,x,y,name,dir,anim,moving,shadow=true){
  const im=this.images[name+(moving?'Run':'Idle')],rect=characterFrameRect(dir,anim,moving);
  const {width,height,anchorX,anchorY}=CHARACTER_SPRITE;
  if(shadow){g.fillStyle='#17233955';g.beginPath();g.ellipse(x,y-1,10,3.5,0,0,TAU);g.fill();}
  // Native 1:1 pixels. No fractional 16->24 resize that drops fine face details.
  g.drawImage(im,rect.x,rect.y,rect.width,rect.height,Math.round(x-anchorX),Math.round(y-anchorY),width,height);
 }

 drawPlayer(g){const p=this.player;if(p.inv>0&&p.dashTime<=0&&Math.floor(this.time*18)%2===0)g.globalAlpha=.5;this.drawCharacter(g,p.x,p.y,'ryoma',p.dir,this.mode==='playing'?p.anim:this.time*2,p.moving||p.dashTime>0);g.globalAlpha=1;
  // Gold foot marker separates the protagonist from school NPCs.
  g.strokeStyle='#e7cf8d88';g.lineWidth=.7;g.beginPath();g.ellipse(p.x,p.y+1,11,4,0,Math.PI*.1,Math.PI*.9);g.stroke();
 }
 drawEnemy(g,e){const key=e.boss?'big_demon':e.type==='caster'?'necromancer':'chort';const im=this.images[key],w=im.width/4,h=im.height,s=e.boss?2.2:1.65;
  this.glow(g,e.x,e.y-8,e.boss?50:23,'#9673c4',.12);g.fillStyle='#20203977';g.beginPath();g.ellipse(e.x,e.y,w*s*.4,5*s,0,0,TAU);g.fill();
  g.save();if(e.spawn>0)g.globalAlpha=1-e.spawn*.7;if(e.hit>0)g.filter='brightness(2)';g.translate(e.x,e.y-2+Math.sin(e.anim)*1.4);if(this.player.x<e.x)g.scale(-1,1);g.drawImage(im,(Math.floor(e.anim)%4)*w,0,w,h,-w*s/2,-h*s,w*s,h*s);g.restore();
  if(e.hp<e.maxHP&&!e.boss){g.fillStyle='#1d1f32';g.fillRect(e.x-13,e.y-h*s-9,26,3);g.fillStyle='#ba9cd0';g.fillRect(e.x-13,e.y-h*s-9,26*(e.hp/e.maxHP),2);}
  if(e.windup>0){g.strokeStyle=e.type==='caster'?'#d1aed9':'#e6a78b';g.lineWidth=1;g.beginPath();g.ellipse(e.x,e.y,(e.boss?30:18)+Math.sin(this.time*18)*2,e.boss?13:7,0,0,TAU);g.stroke();this.drawMarker(g,e.x,e.y-h*s-12,'!', '#e7c1bd');}
 }
 drawRift(g,x,y,done,active,s=1){
  const t=this.time;const color=done?'#cbb887':'#a28bc9';const r=(active?38:27)*s;
  this.glow(g,x,y-12,r*2.3,color,done?.1:.26);g.save();g.translate(x,y);g.strokeStyle=done?'#d2be8755':'#bca2d4aa';g.lineWidth=.8;
  g.beginPath();g.ellipse(0,0,r,r*.4,0,0,TAU);g.stroke();g.setLineDash([4,7]);g.beginPath();g.ellipse(0,0,r+7,(r+7)*.4,0,t*.08,TAU+t*.08);g.stroke();g.setLineDash([]);
  if(done){g.font='15px serif';g.textAlign='center';g.fillStyle='#e3cfa5aa';g.fillText('✧',0,-5);g.restore();return;}
  const yy=-20+Math.sin(t*1.9)*4;g.fillStyle='#5f4c9290';g.beginPath();g.moveTo(0,yy-20);g.lineTo(11,yy);g.lineTo(0,yy+17);g.lineTo(-11,yy);g.closePath();g.fill();g.strokeStyle='#ddc9fa';g.stroke();g.lineWidth=.6;g.beginPath();g.moveTo(0,yy-20);g.lineTo(0,yy+17);g.moveTo(-11,yy);g.lineTo(11,yy);g.stroke();g.fillStyle='#ede1fa';g.fillRect(-1,yy-7,2,14);g.fillRect(-5,yy-1,10,2);
  for(let i=0;i<9;i++){const a=t*.65+i*TAU/9;const px=Math.cos(a)*r*.9,py=Math.sin(a)*r*.34-10-Math.sin(t+i)*5;g.fillStyle=i%2?'#dac6eb':'#a38ac5';g.globalAlpha=.5+.4*Math.sin(t+i);g.fillRect(px,py,1,2);}g.globalAlpha=1;g.restore();
 }
 drawMarker(g,x,y,text,color){g.save();g.translate(Math.round(x),Math.round(y+Math.sin(this.time*2+x)*1.5));g.fillStyle='#141f31c9';g.strokeStyle='#c4b49566';g.lineWidth=.5;const w=text==='···'?18:13;g.fillRect(-w/2,-10,w,13);g.strokeRect(-w/2,-10,w,13);g.fillStyle=color;g.font='10px serif';g.textAlign='center';g.fillText(text,0,0);g.fillStyle='#c4b49588';g.beginPath();g.moveTo(-2,4);g.lineTo(2,4);g.lineTo(0,6);g.fill();g.restore();}
 drawPortal(g,p){const near=distance(p,this.player)<80;g.save();g.translate(p.x,p.y);g.strokeStyle=near?'#ead5a9':'#c8b78277';g.lineWidth=1;const dir=p.to===0?Math.PI:p.to===1&&this.room!==0?Math.PI/2:this.room===0?0:-Math.PI/2;g.rotate(dir);for(let i=0;i<2;i++){g.beginPath();g.moveTo(-3+i*7,-5);g.lineTo(1+i*7,0);g.lineTo(-3+i*7,5);g.stroke();}g.restore();if(near){g.font='8px "Noto Sans JP"';g.textAlign='center';g.fillStyle='#e6d8bd';g.fillText(p.label,p.x,p.y-17);g.textAlign='left';}}
 glow(g,x,y,r,color,alpha){g.save();const grd=g.createRadialGradient(x,y,0,x,y,r);grd.addColorStop(0,color);grd.addColorStop(1,color+'00');g.globalAlpha=alpha;g.globalCompositeOperation='screen';g.fillStyle=grd;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
 drawLight(g,over){const isDark=this.room===2;
  if(!over){
   for(let i=0;i<4;i++){const y=136+i*104;g.save();g.globalCompositeOperation='screen';const grad=g.createLinearGradient(75,y,535,y+130);grad.addColorStop(0,isDark?'#8f9ec748':'#f2c78b55');grad.addColorStop(1,'#e7aa6800');g.fillStyle=grad;g.beginPath();g.moveTo(78,y);g.lineTo(78,y+50);g.lineTo(550,y+206);g.lineTo(550,y+117);g.closePath();g.fill();g.globalAlpha=.34;g.fillStyle='#d3a575';g.beginPath();g.moveTo(78,y+27);g.lineTo(78,y+32);g.lineTo(540,y+170);g.lineTo(540,y+161);g.closePath();g.fill();g.restore();}
   return;
  }
  g.save();const grad=g.createLinearGradient(0,0,900,0);grad.addColorStop(0,isDark?'#2b31502c':'#da916527');grad.addColorStop(.55,'#5550720c');grad.addColorStop(1,'#1a254f3c');g.fillStyle=grad;g.fillRect(0,0,896,576);
  for(let i=0;i<(this.settings.particles?this.motes.length:25);i++){const m=this.motes[i];const x=(m.x+this.time*m.s*.45)%896,y=(m.y-this.time*m.s*.24+57600)%576;g.globalAlpha=(.2+.35*Math.sin(this.time*.7+m.p)**2)*(x<500?1:.5);g.fillStyle=isDark?'#bec2dc':'#f0d9a6';g.fillRect(Math.round(x),Math.round(y),m.r,m.r);}
  g.restore();
 }
 updateHUD(){this.ui.update(this);}
}
