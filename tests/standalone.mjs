import {chromium} from '@playwright/test';
import sp from '@sparticuz/chromium';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||await sp.executablePath(),args:sp.args,headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[],network=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
try{
 await page.context().setOffline(true);
 await page.goto(pathToFileURL(path.resolve('release/honshitsu.html')).href);
 await page.locator('#loading').waitFor({state:'hidden',timeout:30000});
 assert.equal(await page.evaluate(()=>typeof window.__game),'undefined','development hooks must not ship');
 await page.click('#start-btn');
 if(await page.locator('#intro').isVisible())await page.click('#start-btn');
 for(let n=0;n<20&&await page.locator('#dialogue').isVisible();n++)await page.keyboard.press('KeyE');
 assert.equal(await page.locator('#intro').isVisible(),false);assert.equal(await page.locator('#dialogue').isVisible(),false);
 await page.keyboard.down('KeyW');await page.waitForTimeout(500);await page.keyboard.up('KeyW');await page.keyboard.press('KeyQ');
 await page.click('#menu-btn');await page.click('[data-tab="credits"]');
 const downloadEvent=page.waitForEvent('download');await page.getByText('同梱ライセンス',{exact:true}).click();const download=await downloadEvent;assert.equal(download.suggestedFilename(),'LimeZu-license.txt');
 await page.click('#close-menu');await page.screenshot({path:'.cache/standalone.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
 console.log('PASS standalone file:// boot, offline image/font/audio URLs, dialogue, controls, embedded license download, no runtime HTTP requests, no development hooks');
}finally{await browser.close();}
