import fs from 'node:fs';
import path from 'node:path';
const root='dist';
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const mime={'.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2','.txt':'text/plain;charset=utf-8','.md':'text/plain;charset=utf-8','.json':'application/json'};
const assets={};
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())scan(p);else{const ext=path.extname(p);if(mime[ext])assets['/'+path.relative(root,p).replaceAll('\\','/')]=`data:${mime[ext]};base64,${fs.readFileSync(p).toString('base64')}`;}}}
scan(root);
const cssMatch=html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
let css=fs.readFileSync(path.join(root,cssMatch[1]),'utf8');
for(const [url,data]of Object.entries(assets)){if(url.startsWith('/fonts/'))css=css.replaceAll(url,data);}
html=html.replace(cssMatch[0],'<style>'+css+'</style>');
const jsMatch=html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
let js=fs.readFileSync(path.join(root,jsMatch[1]),'utf8');
for(const [url,data]of Object.entries(assets))html=html.replaceAll(`"${url}"`,`"${data}"`);
const runtimeAssets=Object.fromEntries(Object.entries(assets).filter(([url])=>!url.startsWith('/fonts/')));
const bundle='<script>window.__INLINE_ASSETS__='+JSON.stringify(runtimeAssets).replaceAll('<','\\u003c')+';</script><script type="module">'+js.replaceAll('</script','<\\/script')+'</script>';
// Keep the inline module after the game DOM, as with the source entry point.
html=html.replace(jsMatch[0],'').replace('</body>',bundle+'\n</body>');
fs.mkdirSync('release',{recursive:true});fs.writeFileSync('release/honshitsu.html',html);
console.log(`Single-file release: release/honshitsu.html (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB)`);
