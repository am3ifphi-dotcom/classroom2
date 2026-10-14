import {assetURL} from './assets.js';
import {clamp} from './state.js';
const AUDIO='/assets/audio/';
const SFX={step:['footstep00.ogg','footstep01.ogg'],attack:['knifeSlice.ogg','knifeSlice2.ogg'],dash:['cloth1.ogg'],hit:['metalPot1.ogg'],cast:['zapThreeToneUp.ogg'],seal:['powerUp5.ogg'],hurt:['lowDown.ogg'],talk:['bookFlip1.ogg'],open:['bookOpen.ogg'],door:['doorOpen_1.ogg']};
export class AudioManager{
 constructor(){this.unlocked=false;this.enabled=true;this.volume=.45;this.music=null;this.current='';this.voices=[];this.musicLevel=0;this.targetLevel=0;this.pool={};}
 unlock(){if(this.unlocked)return;this.unlocked=true;this.playMusic('music-moon');}
 playMusic(track){if(this.current===track)return;this.music?.pause();this.current=track;const music=new Audio(assetURL(AUDIO+track+'.mp3'));music.loop=true;music.volume=0;this.music=music;this.musicLevel=0;if(this.enabled&&this.unlocked)music.play().catch(()=>{});}
 toggle(){this.enabled=!this.enabled;if(this.enabled&&this.unlocked)this.music?.play().catch(()=>{});else{this.music?.pause();for(const a of this.voices)a.pause();}return this.enabled;}
 update(dt,quiet=false){this.targetLevel=this.enabled?this.volume*(quiet?.22:.50):0;this.musicLevel+=clamp(dt*2,0,1)*(this.targetLevel-this.musicLevel);if(this.music)this.music.volume=clamp(this.musicLevel,0,1);this.voices=this.voices.filter(a=>!a.ended);}
 play(name,vol=1){if(!this.unlocked||!this.enabled||!SFX[name])return;const files=SFX[name];const src=files[Math.floor(Math.random()*files.length)];const list=this.pool[src]||=[];let a=list.find(x=>x.paused||x.ended);if(!a){if(list.length>=5)return;a=new Audio(assetURL(AUDIO+src));list.push(a);}a.currentTime=0;a.volume=clamp(this.volume*vol,0,1);a.playbackRate=name==='step'?(.9+Math.random()*.18):1;a.play().catch(()=>{});this.voices.push(a);}
 suspend(){this.music?.pause();for(const a of this.voices)a.pause();}
 resume(){if(this.enabled&&this.unlocked)this.music?.play().catch(()=>{});}
}
