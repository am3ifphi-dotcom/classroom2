import {chromium} from '@playwright/test';
import sp from '@sparticuz/chromium';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||await sp.executablePath(),args:sp.args,headless:true});
const errors=[];
async function setup(options){
 const page=await browser.newPage(options);
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(process.env.TEST_URL||'http://localhost:5173');await page.waitForFunction(()=>window.__game);await page.locator('#loading').waitFor({state:'hidden'});
 if(options.hasTouch)await page.locator('#start-btn').tap();else await page.click('#start-btn');
 if(await page.evaluate(()=>__game.mode)==='title')await page.keyboard.press('Enter');
 for(let i=0;i<30&&await page.evaluate(()=>__game.mode)==='dialogue';i++)await page.keyboard.press('KeyE');
 assert.equal(await page.evaluate(()=>__game.mode),'playing');
 // Only initial positioning/progress is a fixture. Every room change below
 // must go through real keyboard/touch input; never call changeRoom directly.
 await page.evaluate(()=>{__game.progress.seals=[0];__game.player.x=725;__game.player.y=354;__game.ui.updateQuest();});
 return page;
}
async function walk(page,key,axis,target,sign){
 await page.keyboard.down(key);
 try{await page.waitForFunction(({axis,target,sign})=>(__game.player[axis]-target)*sign>=0,{axis,target,sign},{timeout:15000});}
 finally{await page.keyboard.up(key);}
}
async function cross(page,to,key='KeyE'){
 await page.waitForFunction(()=>__game.portalTravel.remaining===0&&__game.nearest()?.kind==='portal');
 await page.keyboard.press(key);assert.equal(await page.evaluate(()=>__game.room),to);
 for(let i=0;i<8;i++)await page.keyboard.press(key);
 assert.equal(await page.evaluate(()=>__game.room),to,'rapid E/Enter must not bounce');
 await page.waitForFunction(()=>__game.portalTravel.remaining===0);
 for(let i=0;i<3;i++)await page.keyboard.press(key);
 assert.equal(await page.evaluate(()=>__game.room),to,'stationary repeat after debounce must not bounce');
 assert.equal(await page.locator('#interaction').isVisible(),false,'no stale return-door prompt at spawn');
}
try{
 const page=await setup({viewport:{width:1280,height:800}});
 await walk(page,'KeyD','x',763,1);
 await page.keyboard.down('KeyE');
 assert.equal(await page.evaluate(()=>__game.room),1);
 // Playwright's subsequent down events carry the browser repeat flag.
 for(let i=0;i<6;i++)await page.keyboard.down('KeyE');
 await page.waitForFunction(()=>__game.portalTravel.remaining===0);await page.keyboard.down('KeyE');await page.keyboard.up('KeyE');
 for(let i=0;i<8;i++)await page.keyboard.press('KeyE');
 assert.equal(await page.evaluate(()=>__game.room),1);
 assert.equal(await page.locator('#interaction').isVisible(),false);
 console.log('PASS classroom → corridor using real D/E; held and rapid E do not return to classroom');
 await page.screenshot({path:'.cache/corridor-arrival.png',timeout:60000});
 await walk(page,'KeyD','x',355,1);await walk(page,'KeyW','y',166,-1);await cross(page,2);
 await walk(page,'KeyS','y',474,1);await cross(page,1,'Enter');
 console.log('PASS corridor ↔ archive using real movement and E/Enter');
 await walk(page,'KeyS','y',270,1);await walk(page,'KeyD','x',728,1);await walk(page,'KeyW','y',166,-1);await cross(page,3);
 await walk(page,'KeyS','y',474,1);await cross(page,1);
 console.log('PASS corridor ↔ physics prep room using real movement and E');
 await walk(page,'KeyS','y',300,1);await walk(page,'KeyA','x',122,-1);await cross(page,0);
 await walk(page,'KeyD','x',763,1);await cross(page,1);
 console.log('PASS intentional corridor → classroom → corridor roundtrip, no immediate return');
 const mobile=await setup({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 await walk(mobile,'KeyD','x',763,1);
 for(let i=0;i<8;i++)await mobile.locator('#touch-interact').tap();
 await mobile.waitForFunction(()=>__game.portalTravel.remaining===0);await mobile.locator('#touch-interact').tap();
 assert.equal(await mobile.evaluate(()=>__game.room),1);
 await walk(mobile,'KeyA','x',122,-1);await mobile.locator('#touch-interact').tap();
 assert.equal(await mobile.evaluate(()=>__game.room),0);
 assert.deepEqual(errors,[]);
 console.log('PASS touch E repeated taps and intentional return, no JS/HTTP errors');
}finally{await browser.close();}
