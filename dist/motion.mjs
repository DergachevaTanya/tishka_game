const limit=t=>Math.max(0,Math.min(1,t));
export function moveDirection(from,to){
 const dx=to.x-from.x,dy=to.y-from.y;
 if(Math.abs(dx)>Math.abs(dy))return dx<0?'left':'right';
 return dy<0?'up':'down';
}
export function jumpFrame(direction,progress,long=false,reduced=false){
 const t=limit(progress),air=limit((t-.12)/.76),arc=Math.sin(Math.PI*air);
 const side=direction==='left'?-1:1,preparing=t<.12,landing=t>.88;
 return {col:direction==='up'?(preparing||landing?1:0):(preparing||landing?0:1),row:preparing||landing?1:0,
  flip:direction==='up'?1:side,lift:reduced?0:arc*(long?78:37),
  lean:reduced?0:arc*(direction==='up'?-.045:side*.19),
  stretch:reduced?1:preparing?1-Math.sin(t/.12*Math.PI)*.15:landing?1-Math.sin((t-.88)/.12*Math.PI)*.1:1+arc*.05,
  preparing,landing};
}
export const POND_FISH=[
 {cx:430,cy:300,rx:210,ry:75,speed:.095,phase:0,size:72,style:0,alpha:.65},
 {cx:440,cy:440,rx:190,ry:60,speed:.075,phase:2.3,size:59,style:1,alpha:.54},
 {cx:300,cy:260,rx:130,ry:75,speed:.11,phase:4,size:53,style:2,alpha:.59},
 {cx:560,cy:340,rx:130,ry:110,speed:.08,phase:1.3,size:79,style:3,alpha:.65},
 {cx:350,cy:375,rx:170,ry:60,speed:.1,phase:3.05,size:44,style:2,alpha:.57},
 {cx:368,cy:391,rx:170,ry:60,speed:.1,phase:3.2,size:39,style:1,alpha:.53},
 {cx:342,cy:405,rx:170,ry:60,speed:.1,phase:3.35,size:42,style:2,alpha:.57},
 {cx:360,cy:200,rx:200,ry:50,speed:.065,phase:.7,size:51,style:0,alpha:.5}
];
export function fishState(fish,seconds){
 const a=fish.phase+seconds*fish.speed;
 const x=fish.cx+fish.rx*Math.cos(a)+Math.sin(a*2.3)*7;
 const y=fish.cy+fish.ry*Math.sin(a)+Math.cos(a*1.7)*6;
 const vx=-fish.rx*Math.sin(a)+16.1*Math.cos(a*2.3),vy=fish.ry*Math.cos(a)-10.2*Math.sin(a*1.7);
 return {x,y,heading:Math.atan2(vy,vx)};
}

export function fishOrientation(heading){
 const flip=Math.cos(heading)<0?-1:1;
 return {flip,tilt:0};
}
