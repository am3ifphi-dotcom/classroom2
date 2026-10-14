export const TILE = 16;
export const WORLD_W = 896, WORLD_H = 576;
// All furniture coordinates refer to LimeZu's free 16px interior atlas.
export const OBJECTS = {
 desk:[32,576,16,32],notesDesk:[48,576,16,32],bookDesk:[64,576,16,32],chair:[0,608,16,32],
 teacher:[80,576,32,32],labTable:[112,608,32,32],labBooks:[112,640,32,32],
 board:[160,640,32,32],blackboard:[208,640,32,32],globe:[208,576,16,32],
 bookshelf:[192,1088,32,48],bookshelf2:[224,1088,32,48],plant:[208,704,32,48],plant2:[160,704,32,48],
 flowers:[64,848,16,32],cabinet:[112,768,32,48],cabinetGlass:[144,784,32,32],
 window:[32,448,32,32],window2:[112,448,48,32],door:[112,768,32,48],
 notice:[0,656,32,16],rug:[0,672,48,32],rug2:[48,672,48,32],
 sofa:[16,1152,48,32],sofa2:[64,1152,48,32],clock:[48,400,16,16],
 vending:[32,288,32,48],bin:[0,1056,16,32],lamp:[160,896,16,32],
 papers:[0,352,16,16],piano:[0,784,32,32],globeSmall:[0,816,32,32],
};
const O=(kind,x,y,s=1,solid=true)=>({kind,x,y,s,solid});
export const ROOM_INFO = [
 {name:'理数科 1年B組',subtitle:'いつもの教室に、知らない影。',weather:'夕凪',tint:'#b78965',floor:0},
 {name:'北棟・渡り廊下',subtitle:'南と北のあいだ。どちらでもない場所。',weather:'薄暮',tint:'#66828a',floor:1},
 {name:'旧資料室',subtitle:'名前のない記録が、こちらを見ている。',weather:'静寂',tint:'#82718d',floor:2},
 {name:'物理準備室',subtitle:'観測されなかった、もうひとつの放課後。',weather:'残照',tint:'#6d9296',floor:1},
];
export const PORTALS = [
 [{x:793,y:354,to:1,label:'渡り廊下へ',spawn:[164,300]}],
 [{x:90,y:300,to:0,label:'1年B組へ',spawn:[725,354]},{x:355,y:127,to:2,label:'旧資料室へ',spawn:[440,437]},{x:728,y:127,to:3,label:'物理準備室へ',spawn:[440,437]}],
 [{x:440,y:509,to:1,label:'渡り廊下へ',spawn:[355,205]}],
 [{x:440,y:509,to:1,label:'渡り廊下へ',spawn:[728,205]}]
];
export const RIFTS = [{room:0,x:423,y:174,name:'言葉の綻び'},{room:2,x:434,y:201,name:'記録の綻び'},{room:3,x:444,y:209,name:'観測の綻び'}];
export const NPCS=[{id:'mie',room:0,x:466,y:369,name:'三重 県臣',role:'否定の守護者'},{id:'rei',room:0,x:587,y:192,name:'数理 零',role:'理数科・学年首席'}];
export const NOTES=[{id:0,room:0,x:238,y:439,title:'窓際のメモ',text:'「明日の自分が、今日の自分を他人だと言ったら？」\n端に、えんじ色のインクで小さな十字が描かれている。誰の字でもない。'},{id:1,room:2,x:704,y:389,title:'未返却の貸出票',text:'返却期限は「昨日」。借りた人の名前は、読むたびに自分の名前に見える。\n本はまだ、ここにある。帰る人だけが足りない。'},{id:2,room:3,x:206,y:350,title:'観測日誌・空白の一分',text:'17時32分。実験結果、異常なし。\n17時32分。実験結果、異常なし。\n最後の行だけが違う。「異常なし、という異常。」'}];
export function roomObjects(room){
 const a=[];
 if(room===0){
  for(const x of [190,264,338,500,574])for(let r=0;r<3;r++){
   const y=234+r*72; a.push(O((Math.round(x/10)+r)%3===0?'notesDesk':r===1?'bookDesk':'desk',x,y,1.45));a.push(O('chair',x+1,y+31,1.20));
  }
  a.push(O('teacher',363,117,1.5),O('globe',531,123,1.5),O('bookshelf',629,89,1.5),O('bookshelf2',675,89,1.5),O('plant',104,130,1.4),O('plant2',647,418,1.5),O('cabinet',739,109,1.5),O('sofa',735,428,1.3),O('bin',730,397,1.3),O('notice',692,180,1.4),O('papers',236,424,1.1,false));
 }else if(room===1){
  for(const x of [180,465,774])a.push(O('plant',x,126,1.5));
  a.push(O('sofa',150,438,1.8),O('sofa2',275,438,1.8),O('plant2',380,438,1.4),O('vending',656,384,1.7),O('cabinetGlass',750,398,1.5),O('notice',528,123,1.7));
  for(const x of [260,620])a.push(O('plant2',x,118,1.3));
 }else if(room===2){
  for(const x of [120,175,230,600,655,710])a.push(O('bookshelf',x,95,1.6));
  for(const x of [120,180,650,710])for(const y of [242,350])a.push(O('bookshelf2',x,y,1.4));
  a.push(O('teacher',373,322,1.8),O('chair',423,371,1.5),O('plant',780,442,1.3),O('globe',535,120,1.5),O('rug2',368,331,2.2,false));
 }else{
  for(const x of [125,205,640,720])a.push(O('cabinetGlass',x,100,1.6));
  for(const x of [175,646])for(const y of [246,361])a.push(O('labBooks',x,y,1.9),O('chair',x+9,y+52,1.5));
  a.push(O('globeSmall',319,127,1.5),O('labTable',475,124,1.5),O('plant2',777,435,1.5));
 }
 return a;
}
export function collisionRects(room){
 const rects=[{x:0,y:0,w:896,h:116},{x:0,y:0,w:78,h:576},{x:824,y:0,w:72,h:576},{x:0,y:535,w:896,h:41}];
 if(room===0){rects.push({x:701,y:116,w:12,h:190},{x:701,y:395,w:12,h:140});}
 for(const o of roomObjects(room)){
  if(!o.solid)continue;const [, ,w,h]=OBJECTS[o.kind];
  rects.push({x:o.x+2*o.s,y:o.y+(h*.56)*o.s,w:(w-4)*o.s,h:h*.32*o.s});
 }
 return rects;
}
export function circleBlocked(x,y,r,rects){return rects.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h);}
export function moveWithCollision(entity,dx,dy,rects,r=7){
 // Swept substeps prevent tunnelling during a dash or a slow frame.
 const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));
 for(let i=0;i<n;i++){if(!circleBlocked(entity.x+dx/n,entity.y,r,rects))entity.x+=dx/n;if(!circleBlocked(entity.x,entity.y+dy/n,r,rects))entity.y+=dy/n;}
}
export function makeRoomBackground(room,images){
 const c=document.createElement('canvas');c.width=WORLD_W;c.height=WORLD_H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const sheet=images.room, interiors=images.interior;
 const floor=ROOM_INFO[room].floor;
 const tile=floor===0?[176,208,48,32]:floor===1?[192,184,16,16]:[176,208,48,32];
 g.fillStyle='#48494c';g.fillRect(0,0,WORLD_W,WORLD_H);
 for(let y=0;y<WORLD_H;y+=tile[3])for(let x=0;x<WORLD_W;x+=tile[2]){g.drawImage(sheet,...tile,x,y,tile[2],tile[3]);}
 // Restrained grading unifies externally drawn tiles without obscuring pixel detail.
 g.fillStyle=floor===0?'#bca17c91':floor===1?'#152e495c':'#18233b50';g.fillRect(0,0,WORLD_W,WORLD_H);
 for(let y=116;y<536;y+=64){g.fillStyle='#f9dfb711';g.fillRect(78,y,746,1);}
 // Wainscot walls built from the external room-builder strip.
 for(let x=0;x<896;x+=16){g.drawImage(sheet,16,144,16,32,x,52,16,48);g.drawImage(sheet,16,208,16,32,x,100,16,16);}
 g.fillStyle='#2c303f';g.fillRect(0,0,896,50);g.fillStyle='#4d4b55';g.fillRect(0,48,896,5);g.fillStyle='#151d2980';g.fillRect(0,112,896,7);
 // Left window wall with repeated authored window frames and sunset panes.
 for(let y=133;y<494;y+=104){
  g.fillStyle='#232d3c';g.fillRect(25,y,50,72);g.fillStyle=room===2?'#667494':'#ccb997';g.fillRect(30,y+4,40,62);
  g.drawImage(interiors,32,448,32,32,22,y,52,72);
  const sky=g.createLinearGradient(0,y,0,y+70);sky.addColorStop(0,room===2?'#5c719f':'#eac39c');sky.addColorStop(1,room===2?'#8e90b3':'#d58784');
  g.globalAlpha=.75;g.fillStyle=sky;g.fillRect(29,y+7,17,23);g.fillRect(50,y+7,17,23);g.fillRect(29,y+35,17,22);g.fillRect(50,y+35,17,22);g.globalAlpha=1;
  g.fillStyle='#1b263d66';g.fillRect(26,y+70,54,5);
 }
 // Trim / wall depth.
 g.fillStyle='#363847';g.fillRect(75,116,5,421);g.fillRect(824,116,8,421);g.fillRect(75,536,757,8);g.fillStyle='#918374';g.fillRect(80,116,2,421);g.fillRect(80,536,744,2);
 if(room===0){
  // Chalkboard uses an expanded middle slice of the supplied school board.
  g.fillStyle='#293a39';g.fillRect(277,66,252,45);g.drawImage(interiors,164,645,24,13,278,67,250,40);
  g.fillStyle='#bac2ab88';g.font='9px "Noto Sans JP"';g.fillText('10 / 14',293,80);g.fillText('放課後',471,80);g.font='11px serif';g.fillText('f(x) = x² + 2x + 1',325,94);g.fillStyle='#d1b386';g.fillRect(274,110,259,4);g.fillStyle='#c6c9b4';g.fillRect(470,108,12,2);
  g.fillStyle='#40404a';g.fillRect(701,117,12,190);g.fillRect(701,395,12,141);g.fillStyle='#948582';g.fillRect(701,117,3,190);g.fillRect(701,395,3,141);
  g.fillStyle='#1c26383d';g.fillRect(714,116,110,420);
  g.fillStyle='#a39f9277';g.fillRect(750,295,65,4);g.fillRect(750,405,65,4);
 }else if(room===1){
  for(let x=96;x<822;x+=64){g.fillStyle='#9faeac18';g.fillRect(x,235,32,280);}
  for(const x of [326,699]){g.fillStyle='#252f40';g.fillRect(x,57,62,63);g.drawImage(interiors,112,768,32,48,x+6,48,48,72);}
  g.fillStyle='#c5c5b0';g.font='8px "Noto Sans JP"';g.fillText('資料室',337,54);g.fillText('物理準備室',700,54);
  // A faded institutional line, not an impassable barrier.
  g.fillStyle='#c7b17144';g.fillRect(466,120,2,414);
 }else{
  g.fillStyle='#26313d';g.fillRect(394,514,91,28);g.fillStyle='#cfc5a659';g.fillRect(394,514,91,2);
 }
 // Floor furniture such as rugs must be below sprites and feet.
 for(const o of roomObjects(room).filter(o=>!o.solid))drawObject(g,interiors,o,false);
 return c;
}
export function drawObject(g,sheet,o,shadow=true){
 const [sx,sy,w,h]=OBJECTS[o.kind];
 if(shadow){g.fillStyle='#1921342c';g.beginPath();g.ellipse(o.x+w*o.s*.57,o.y+h*o.s*.9,w*o.s*.48,5*o.s,0,0,Math.PI*2);g.fill();}
 g.drawImage(sheet,sx,sy,w,h,Math.round(o.x),Math.round(o.y),Math.round(w*o.s),Math.round(h*o.s));
}
