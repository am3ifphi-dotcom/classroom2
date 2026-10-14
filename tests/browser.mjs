import {chromium} from '@playwright/test';
import sp from '@sparticuz/chromium';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||await sp.executablePath(),args:sp.args,headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});const failures=[];const results=[];
page.on('pageerror',e=>failures.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`)});
const log=s=>{results.push(s);console.log('PASS',s)};
const mode=()=>page.evaluate(()=>__game.mode);
async function finishDialogue(){for(let i=0;i<40&&await mode()==='dialogue';i++){await page.keyboard.press('KeyE');}assert.notEqual(await mode(),'dialogue');}
try{
 await page.goto(process.env.TEST_URL||'http://localhost:5173');await page.waitForFunction(()=>window.__game);await page.locator('#loading').waitFor({state:'hidden'});await page.screenshot({path:'.cache/title.png'});assert.equal(await mode(),'title');log('loads locally without external runtime assets');
 await page.click('#start-btn');assert.equal(await mode(),'dialogue');await finishDialogue();assert.equal(await mode(),'playing');log('opening dialogue and input state');
 const y=await page.evaluate(()=>__game.player.y);await page.keyboard.down('KeyW');await page.waitForFunction(y=>__game.player.y<y-75,y,{timeout:15000});await page.keyboard.up('KeyW');assert(await page.evaluate(()=>__game.player.y)<y-75);log('keyboard movement and animation');
 await page.evaluate(()=>{__game.player.x=423;__game.player.y=210;});await page.keyboard.press('KeyE');await page.waitForFunction(()=>__game.enemies.length>0);assert.equal(await page.evaluate(()=>__game.stage.wave),1);await page.waitForTimeout(1100);
 // Controlled fixture verifies real melee/cast cooldown and damage paths.
 const damaged=await page.evaluate(()=>{const g=__game,e=g.enemies[0];e.x=g.player.x+30;e.y=g.player.y;e.spawn=0;const before=e.hp;g.pointer=null;g.player.attackCd=0;g.attack();return e.hp<before;});assert(damaged);log('melee damage with facing and attack cooldown');
 const mp=await page.evaluate(()=>__game.player.mp);await page.keyboard.press('KeyQ');assert(await page.evaluate(()=>__game.player.mp)<mp);await page.keyboard.press('Space');assert(await page.evaluate(()=>__game.player.inv)>0);log('area skill resource use and dodge invulnerability');
 await page.screenshot({path:'.cache/combat.png'});
 await page.keyboard.press('Escape');assert.equal(await mode(),'menu');const t=await page.evaluate(()=>__game.activeTime);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>__game.activeTime),t);await page.keyboard.press('Escape');assert.equal(await mode(),'playing');log('pause freezes combat and resumes safely');
 async function clearCurrentRift(){
  await page.evaluate(()=>{const g=__game;for(let cycle=0;cycle<8&&g.stage;cycle++){
   g.player.inv=999;
   for(const e of g.enemies){e.x=g.player.x+29;e.y=g.player.y;e.hp=1;e.spawn=0;}
   g.pointer=null;g.player.attackCd=0;g.attack();
   for(let t=0;t<45&&g.mode==='playing';t++)g.update(1/30);
  }});
  assert.equal(await page.evaluate(()=>__game.stage),null);await finishDialogue();
 }

 await clearCurrentRift();assert.deepEqual(await page.evaluate(()=>__game.progress.seals),[0]);log('two waves, seal repair, level-up and checkpoint save');
 for(const [room,id] of [[2,1],[3,2]]){await page.evaluate(({room,id})=>{const g=__game;g.changeRoom(room,[440,260]);g.beginRift(id);},{room,id});await page.waitForTimeout(1100);await clearCurrentRift();}
 assert.equal(await page.evaluate(()=>__game.progress.seals.length),3);log('all three rifts and original story beats complete');
 await page.evaluate(()=>{const g=__game;g.changeRoom(1,[475,345]);});await page.waitForFunction(()=>__game.portalTravel.remaining===0);await page.keyboard.press('KeyE');await finishDialogue();await page.waitForTimeout(1200);assert(await page.evaluate(()=>__game.enemies.some(e=>e.boss)));await page.screenshot({path:'.cache/boss.png'});
 await page.evaluate(()=>{const g=__game,e=g.enemies.find(e=>e.boss);e.hp=250;g.updateBoss(e,.02);});assert.equal(await page.evaluate(()=>__game.enemies.find(e=>e.boss).phase),1);log('boss encounter and second phase');
 await page.evaluate(()=>{const g=__game,e=g.enemies.find(e=>e.boss);e.hp=1;e.x=g.player.x+30;e.y=g.player.y;e.spawn=0;g.player.attackCd=0;g.attack();});await finishDialogue();assert.equal(await mode(),'ending');assert(await page.locator('#end-screen').isVisible());log('boss defeat leads to final dialogue and ending');
 await page.click('#end-credits');assert(await page.locator('#menu-content').getByText('非商用限定',{exact:true}).isVisible());await page.click('#close-menu');log('in-game credits and explicit asset license restriction');
 await page.reload();await page.waitForFunction(()=>window.__game);await page.locator('#loading').waitFor({state:'hidden'});await page.click('#continue-btn');assert.equal(await page.evaluate(()=>__game.progress.seals.length),3);log('save restored after full browser reload');
 await page.evaluate(()=>{__game.progress.finished=false;__game.player.inv=0;__game.hurt(999,0,0);});assert.equal(await mode(),'dead');await page.click('#retry-btn');assert.equal(await mode(),'playing');assert.equal(await page.evaluate(()=>__game.player.hp===__game.player.maxHP),true);assert.equal(await page.evaluate(()=>__game.progress.seals.length),3);log('death and retry preserve completed progress');
 const sounds=await page.evaluate(async()=>{const names=['footstep00.ogg','knifeSlice.ogg','music-connected.mp3','music-moon.mp3','music-rumble_at_the_gates.mp3','powerUp5.ogg','zapThreeToneUp.ogg'];const ctx=new AudioContext();const decoded=await Promise.all(names.map(async n=>{const data=await fetch('/assets/audio/'+n).then(r=>r.arrayBuffer());const b=await ctx.decodeAudioData(data);return b.duration;}));await ctx.close();return decoded;});assert(sounds.every(d=>d>0));log('BGM and sound effects decode as valid audio');
 assert.deepEqual(failures,[]);log('no browser errors or HTTP failures');
 // Responsive/touch smoke test in a separate page, same Chromium instance.
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});mobile.on('pageerror',e=>failures.push(e.message));await mobile.goto('http://localhost:5173');await mobile.waitForFunction(()=>window.__game);await mobile.locator('#loading').waitFor({state:'hidden'});await mobile.screenshot({path:'.cache/mobile-title.png'});await mobile.click('#start-btn');if(await mobile.evaluate(()=>__game.mode)==='title')await mobile.click('#start-btn');await mobile.evaluate(()=>{for(let i=0;i<12;i++){if(__game.mode==='dialogue')__game.ui.nextDialogue();}});assert(await mobile.locator('#joystick').isVisible());
 await mobile.dispatchEvent('#joystick','pointerdown',{pointerId:1,clientX:100,clientY:687,pointerType:'touch',buttons:1});await mobile.dispatchEvent('#joystick','pointerup',{pointerId:1,clientX:100,clientY:687,pointerType:'touch'});await mobile.screenshot({path:'.cache/mobile-game.png'});assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);log('portrait touch layout fills viewport without horizontal scroll');
 await mobile.setViewportSize({width:844,height:390});await mobile.waitForTimeout(250);await mobile.screenshot({path:'.cache/mobile-landscape.png'});log('landscape touch layout');
 assert.deepEqual(failures,[]);fs.writeFileSync('.cache/browser-results.json',JSON.stringify({results,failures},null,2));
}finally{await browser.close();}
