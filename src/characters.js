// Atlas v3 keeps v2's normalised direction and frame layout. Never use the source pack's R/U/L/D
// order here: the rest of the game uses screen-space L/U/R/D semantics.
export const DIRECTION = Object.freeze({LEFT:0, UP:1, RIGHT:2, DOWN:3});
export const CHARACTER_SPRITE = Object.freeze({width:32,height:48,frames:6,anchorX:16,anchorY:47});
export function directionFromVector(x,y){
  return Math.abs(x)>Math.abs(y)?(x>0?DIRECTION.RIGHT:DIRECTION.LEFT):(y>0?DIRECTION.DOWN:DIRECTION.UP);
}
export function animationFrame(phase,moving){
  const cycle=((phase%6)+6)%6;
  if(moving)return Math.floor(cycle);
  // Breathing poses linger; the closed-eye pose lasts 90ms at 3 phase units/s.
  return [1.8,3,4.2,5.2,5.47,6].findIndex(end=>cycle<end);
}
export function characterFrameRect(direction,phase,moving){
  const {width,height,frames}=CHARACTER_SPRITE;
  return {x:(direction*frames+animationFrame(phase,moving))*width,y:0,width,height};
}
export const CHARACTER_DESIGNS = Object.freeze([
 {id:'ryoma',name:'両馬 二郎',detail:'赤茶色の立ち上げた髪。額を出し、角形の眼鏡。濃紺のブレザーとえんじのネクタイ。'},
 {id:'mie',name:'三重 県臣',detail:'短めの暗褐色の髪と、斜めに流した前髪。角形の眼鏡。襟とネクタイを整えた制服。'},
 {id:'rei',name:'数理 零',detail:'束感のある長めの黒髪。眼鏡なし。緩めたネクタイと開いた襟、右腕に抱えた黒い本。'},
]);
