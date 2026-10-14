export const SAVE_KEY='honshitsu-afterglow-v1';
export const SETTINGS_KEY='honshitsu-settings-v1';
export const MAX_SEALS=3;
export const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function newProgress(){return {version:1,seals:[],notes:[],essence:0,kills:0,seconds:0,introduced:false,finished:false};}
export function validateSave(value){
 if(!value||value.version!==1)return null;
 const p=newProgress();
 p.seals=Array.isArray(value.seals)?[...new Set(value.seals.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
 p.notes=Array.isArray(value.notes)?[...new Set(value.notes.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
 for(const k of ['essence','kills','seconds'])p[k]=typeof value[k]==='number'&&Number.isFinite(value[k])?clamp(Math.floor(value[k]),0,10000000):0;
 p.introduced=value.introduced===true;p.finished=value.finished===true&&p.seals.length===3;
 return p;
}
export function readSave(storage){try{storage??=globalThis.localStorage;return validateSave(JSON.parse(storage.getItem(SAVE_KEY)));}catch{return null;}}
export function writeSave(progress,storage){try{storage??=globalThis.localStorage;storage.setItem(SAVE_KEY,JSON.stringify(validateSave(progress)));return true;}catch{return false;}}
export function statsFor(progress){return {maxHP:100+progress.seals.length*15+progress.notes.length*5,maxMP:60+progress.seals.length*10,damage:18+progress.seals.length*4,level:1+progress.seals.length};}
export function canHit(origin,target,angle,reach=49,halfArc=1.25){const d=distance(origin,target);const diff=Math.atan2(Math.sin(Math.atan2(target.y-origin.y,target.x-origin.x)-angle),Math.cos(Math.atan2(target.y-origin.y,target.x-origin.x)-angle));return d<reach+(target.radius||7)&&Math.abs(diff)<halfArc;}
