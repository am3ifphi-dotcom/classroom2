export const PORTAL_RADIUS=49;
export const PORTAL_RELEASE_RADIUS=PORTAL_RADIUS+12;
export const ARRIVAL_COOLDOWN=.65;

// Debounce room changes independently from attack/interaction cooldowns.
// The entry door stays disarmed until the player has actually cleared it,
// even if a future map accidentally places a spawn inside that door's radius.
export class PortalTravel{
 constructor(){this.reset();}
 reset(){this.remaining=0;this.entryDoor=null;}
 arrive(entryDoor){this.remaining=ARRIVAL_COOLDOWN;this.entryDoor=entryDoor||null;}
 update(dt,player){
  this.remaining=Math.max(0,this.remaining-dt);
  if(this.entryDoor&&Math.hypot(player.x-this.entryDoor.x,player.y-this.entryDoor.y)>PORTAL_RELEASE_RADIUS)this.entryDoor=null;
 }
 canUse(portal){return this.remaining<=0&&portal!==this.entryDoor;}
}
