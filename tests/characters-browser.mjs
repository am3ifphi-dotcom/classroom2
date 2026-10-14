import {chromium} from '@playwright/test';
import sp from '@sparticuz/chromium';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||await sp.executablePath(),args:sp.args,headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
try{
 await page.goto('http://localhost:5173');await page.waitForFunction(()=>window.__game);await page.locator('#loading').waitFor({state:'hidden'});
 await page.click('#start-btn');if(await page.evaluate(()=>__game.mode)==='title')await page.click('#start-btn');
 for(let i=0;i<20&&await page.evaluate(()=>__game.mode)==='dialogue';i++)await page.keyboard.press('KeyE');
 for(const [key,dir,axis,sign] of [['KeyA',0,'x',-1],['KeyW',1,'y',-1],['KeyD',2,'x',1],['KeyS',3,'y',1]]){
  await page.evaluate(()=>{__game.changeRoom(1,[440,300]);__game.player.dashCd=0;__game.player.dashTime=0;});
  const before=await page.evaluate(axis=>__game.player[axis],axis);await page.keyboard.down(key);
  await page.waitForFunction(({axis,before,sign})=>(__game.player[axis]-before)*sign>10,{axis,before,sign});
  assert.equal(await page.evaluate(()=>__game.player.dir),dir);await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__game.player.dir),dir);await page.keyboard.up(key);
 }
 // Verify every profile pose survives the actual canvas renderer pixel-for-pixel.
 const renderedProfiles=await page.evaluate(()=>{
  let checked=0;const actual=document.createElement('canvas'),expected=document.createElement('canvas');actual.width=expected.width=32;actual.height=expected.height=48;
  const a=actual.getContext('2d'),b=expected.getContext('2d');a.imageSmoothingEnabled=b.imageSmoothingEnabled=false;
  for(const name of ['ryoma','mie','rei'])for(const dir of [0,2])for(const moving of [true,false])for(let i=0;i<6;i++){
   a.clearRect(0,0,32,48);b.clearRect(0,0,32,48);
   __game.drawCharacter(a,16,47,name,dir,moving?i+.1:[0,1.9,3.1,4.3,5.3,5.6][i],moving,false);
   b.drawImage(__game.images[name+(moving?'Run':'Idle')],(dir*6+i)*32,0,32,48,0,0,32,48);
   const ap=a.getImageData(0,0,32,48).data,bp=b.getImageData(0,0,32,48).data;
   if(!ap.every((v,index)=>v===bp[index]))throw Error(`profile clipped or resampled: ${name}/${dir}/${moving}/${i}`);
   checked++;
  }
  return checked;
 });assert.equal(renderedProfiles,72);
 await page.evaluate(()=>{__game.changeRoom(1,[440,300]);__game.player.dir=2;__game.player.inv=0;});
 await page.waitForFunction(()=>__game.transition===0);await page.screenshot({path:'.cache/profile-in-game.png',timeout:60000});
 await page.evaluate(()=>{__game.changeRoom(0,[565,225]);__game.player.dir=3;__game.player.dashTime=0;});await page.waitForTimeout(500);await page.screenshot({path:'.cache/rei-in-game.png'});
 await page.click('#menu-btn');await page.click('[data-tab="characters"]');assert.equal(await page.locator('.pose-sprite').count(),12);await page.screenshot({path:'.cache/character-notebook.png'});
 await page.click('[data-motion="idle_anim"]');assert.equal(await page.locator('.pose-sprite.idling').count(),12);
 await page.click('#close-menu');await page.evaluate(()=>{__game.ui.dialogue([['rei','確かめてみよう。']]);});await page.keyboard.press('KeyE');assert.equal(await page.locator('#dialogue-portrait').getAttribute('src'),'/assets/rei-portrait.png');
 assert.deepEqual(errors,[]);console.log('PASS actual A/W/D/S and dash directions, all 72 profiles rendered pixel-for-pixel, 12 character notebook facings, walk/idle toggle, Rei in-game and portrait, no console/HTTP errors');
}finally{await browser.close();}
