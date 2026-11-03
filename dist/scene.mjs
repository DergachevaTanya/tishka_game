import {asset} from './assets.mjs';
import {moveDirection,jumpFrame,POND_FISH,fishState,fishOrientation} from './motion.mjs';
const TAU=Math.PI*2;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>v*v*(3-2*v);
export function createScene(canvas,loading){
 const ctx=canvas.getContext('2d');
 const background=new Image(),atlas=new Image(),pondFish=new Image(),moon=new Image(),castImage=new Image();
 background.src=asset('swamp-watercolor.png');atlas.src=asset('storybook-sprites.png');pondFish.src=asset('pond-fish.png');moon.src=asset('moon-river.png');castImage.src=asset('storybook-cast.png');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let chapter=0,moonReady=false,foxReactAt=-Infinity,guidePoint=null,landCount=0;
 let foxWeights=[1,0,0,0],foxGreetBefore=false,foxWaveAt=0,frameDt=16;
 const rabbitBuffer=document.createElement('canvas'),foxBuffer=document.createElement('canvas');rabbitBuffer.width=rabbitBuffer.height=foxBuffer.width=foxBuffer.height=256;
 let ready=false,fishReady=false,facing='right',fishDisturbance=null,stones=[],fox={x:0,y:0},pose='',poseAt=0;
 let from={x:0,y:0},to={x:0,y:0},started=0,duration=550,landingAt=0;
 let ripples=[],splashes=[],celebratedAt=-Infinity;
 let focused=false,natureTime=0,lastFrame=0,surpriseType=null,surpriseAt=0;
 const fireflies=Array.from({length:19},(_,i)=>({x:60+i*193%740,y:105+i*79%430,phase:i*1.7}));
 Promise.all([background.decode(),atlas.decode(),castImage.decode()]).then(()=>{ready=true;loading.hidden=true}).catch(()=>{loading.textContent='Не удалось загрузить иллюстрации. Обновите страницу.'});
 pondFish.decode().then(()=>{fishReady=true}).catch(()=>{});moon.decode().then(()=>{moonReady=true}).catch(()=>{});
 function position(now){const t=motion.matches?1:smooth(clamp(((now-started)/duration-.12)/.76));return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};}
 function float(x,y,now){if(motion.matches)return {x:0,y:0,angle:0};const phase=x*.027+y*.019;return {x:Math.sin(now/1600+phase)*1.25,y:Math.sin(now/850+phase)*4.4+Math.sin(now/1700+phase)*1.1,angle:Math.sin(now/1300+phase)*.025};}
 function sprite(image,col,row,x,y,size,{angle=0,sx=1,sy=1,alpha=1}={}){
  const w=image.naturalWidth/2,h=image.naturalHeight/2;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(sx,sy);ctx.globalAlpha=alpha;ctx.drawImage(image,col*w,row*h,w,h,-size/2,-size/2,size,size);ctx.restore();
 }
 function ellipse(x,y,rx,ry,color,width=1){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);if(width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}else{ctx.fillStyle=color;ctx.fill()}}
 function shadow(x,y,size=23,opacity=.16){ctx.save();ctx.filter='blur(3px)';ellipse(x,y,size,6,`rgba(39,71,49,${opacity})`,0);ctx.restore()}
 function ripple(x,y,now,strength=1){ripples.push({x,y,at:now,strength});if(ripples.length>30)ripples.shift()}
 function splash(x,y,now,big=false){ripple(x,y,now,big?1.5:1);for(let i=0;i<(big?11:6);i++)splashes.push({x,y,at:now,vx:(Math.sin(i*2.4)*.55),vy:-.1-(i%4)*.045,life:500+i*29});}
 function paintWater(now){
  if(motion.matches)return;
  // Transparent soft caustic ribbons drift on top of the painted pond.
  ctx.save();ctx.beginPath();ctx.rect(130,130,590,415);ctx.clip();
  for(let i=0;i<7;i++){
   const y=180+i*47+Math.sin(now/2400+i)*7;
   ctx.beginPath();for(let j=0;j<=12;j++){const x=140+j*49,yy=y+Math.sin(j*.8+now/1800+i)*4;j?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}
   ctx.strokeStyle=`rgba(255,250,200,${.025+Math.sin(now/1700+i)*.012})`;ctx.lineWidth=3;ctx.stroke();
  }ctx.restore();
 }
 function drawSwimmingFish(style,x,y,size,heading,phase,alpha=1){
  if(!fishReady)return;
  const sw=pondFish.naturalWidth/2,sh=pondFish.naturalHeight/2,col=style%2,row=Math.floor(style/2);
  const {flip}=fishOrientation(heading),beat=motion.matches?0:Math.sin(phase)*.015;
  ctx.save();ctx.translate(x,y);ctx.scale(flip*(.85+.15*Math.abs(Math.cos(heading)))*(1+beat),1-beat*.6);ctx.globalAlpha*=alpha;
  // One intact bitmap per fish: no strip seams and no tiled edges.
  ctx.drawImage(pondFish,col*sw,row*sh,sw,sh,-size/2,-size/2,size,size);ctx.restore();
 }
 function paintFish(natureNow,realNow){
  if(!fishReady)return;
  for(let i=0;i<POND_FISH.length;i++){
   const fish=POND_FISH[i],time=motion.matches?0:natureNow/1000;
   const state=fishState(fish,time);
   let {x,y,heading}=state;
   if(fishDisturbance&&!motion.matches){
    const age=realNow-fishDisturbance.at,dx=x-fishDisturbance.x,dy=y-fishDisturbance.y,d=Math.hypot(dx,dy);
    if(age<4000&&d<185){const push=(1-Math.exp(-age/120))*Math.exp(-age/1350)*(1-d/185)*90;x+=dx/Math.max(1,d)*push;y+=dy/Math.max(1,d)*push;}
   }
   x=Math.max(105,Math.min(750,x));y=Math.max(130,Math.min(545,y));
   const phase=motion.matches?i:realNow/1000*(6+i*.37)+i*1.9;
   drawSwimmingFish(fish.style,x,y,fish.size,heading,phase,fish.alpha);
   if(!motion.matches&&i%3===0){
    for(let j=0;j<2;j++){
     const d=(realNow/1500+j*.9+i)%3;
     const bx=x-Math.cos(heading)*(fish.size*.28+j*7),by=y-Math.sin(heading)*(fish.size*.28+j*7)-d*7;
     ellipse(bx,by,1.3+d*.45,1.4+d*.45,`rgba(239,250,220,${.2*(1-d/3)})`);
    }
   }
  }
 }
 function paintStones(now){
  const places=[...stones,{x:fox.x+58,y:fox.y-7}].sort((a,b)=>a.y-b.y);
  for(const p of places){
   const f=float(p.x,p.y,now);
   const landing=now-landingAt;
   const isLanding=Math.abs(p.x-to.x)<2&&Math.abs(p.y-to.y)<2&&landing>=0&&landing<900;
   const dip=isLanding&&!motion.matches?Math.sin(landing/90)*5*Math.exp(-landing/280):0;
   shadow(p.x,p.y+11,42,.11);
   if(!motion.matches){
    const wave=((now/2000+p.x*.004+p.y*.003)%1);
    ellipse(p.x+f.x,p.y+10,41+wave*17,12+wave*5,`rgba(224,244,202,${(1-wave)*.34})`,1.25);
   }
   sprite(atlas,1,1,p.x+f.x,p.y-1+f.y+dip,112,{angle:f.angle});
  }
 }
 function castBlend(row,weights,buffer,x,y,size,{angle=0,sx=1,sy=1}={}){
  const c=buffer.getContext('2d'),sw=castImage.naturalWidth/4,sh=castImage.naturalHeight/2;
  c.clearRect(0,0,256,256);c.globalCompositeOperation='lighter';
  for(let col=0;col<4;col++){if(weights[col]<.001)continue;c.globalAlpha=weights[col];c.drawImage(castImage,col*sw,row*sh,sw,sh,0,0,256,256)}
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(sx,sy);ctx.drawImage(buffer,-size/2,-size/2,size,size);ctx.restore();
 }
 function paintFox(now){
  const p={x:fox.x+58,y:fox.y-7},f=float(p.x,p.y,now),t=now/1000;
  const joyful=!motion.matches&&now-celebratedAt<3200;
  const greet=!motion.matches&&((!focused&&t%13<3.2)||now-foxReactAt<1700||(surpriseType==='fox'&&(now-surpriseAt)%6500<4500));
  if(greet&&!foxGreetBefore)foxWaveAt=now;foxGreetBefore=greet;
  const pulse=.5-.5*Math.cos((now-foxWaveAt)/1500*Math.PI*2),desired=joyful?[0,0,0,1]:greet?[0,1-pulse,pulse,0]:[1,0,0,0];
  const smoothing=motion.matches?1:1-Math.exp(-frameDt/430);
  foxWeights=foxWeights.map((v,i)=>v+(desired[i]-v)*smoothing);
  const joyLift=joyful?Math.abs(Math.sin((now-celebratedAt)/520))*17*foxWeights[3]:0;
  shadow(p.x,p.y+f.y,24);
  castBlend(1,foxWeights,foxBuffer,p.x+f.x,fox.y-58+f.y-joyLift,132,{sy:motion.matches?1:1+Math.sin(t*1.65)*.009,angle:f.angle*.4});
 }
 function paintRabbit(now){
  const p=position(now),age=now-poseAt,active=['hopping','jumping'].includes(pose)&&age<duration;
  const f=float(p.x,p.y,now),arc=active&&!motion.matches?Math.sin(Math.PI*clamp(age/duration)):0;
  const jump=jumpFrame(facing,age/duration,pose==='jumping',motion.matches);
  const lift=active?jump.lift:0;
  const idle=!active&&pose!=='frozen';
  const breath=idle&&!motion.matches?Math.sin(now/500)*.014:0;
  const curious=idle&&!motion.matches?Math.sin(now/1900)*.027:0;
  const shake=pose==='wrong'&&age<450&&!motion.matches?Math.sin(age/25)*5:0;
  const landAge=now-landingAt;
  const squash=landAge>=0&&landAge<300&&!motion.matches?Math.sin(landAge/300*Math.PI)*.12:0;
  const freeze=pose==='frozen';
  const blink=false;
  const thinking=pose==='thinking'&&!motion.matches?Math.sin(now/550)*.1:0;
  const angle=curious+thinking+(active?jump.lean:0)+f.angle*.5;
  shadow(p.x+f.x,p.y+f.y+2,22-lift/10,.18-lift/900);
  const happy=now-celebratedAt<2500&&!motion.matches?Math.abs(Math.sin((now-celebratedAt)/170))*11:0;
  const dip=landAge>=0&&landAge<900&&!motion.matches?Math.sin(landAge/90)*5*Math.exp(-landAge/280):0;
  const flip=facing==='left'?-1:1;
  const options={angle,sx:(1+squash)*(active?jump.flip:flip),sy:(1+breath-squash)*(active?jump.stretch:1)};
  const weights=[1,0,0,0];
  if(active){
   const t=clamp(age/duration),airIndex=facing==='up'?1:2;
   weights.fill(0);
   const blend=(a,b,w)=>{weights[a]=1-w;weights[b]=w};
   if(t<.16)blend(0,3,smooth(t/.16));
   else if(t<.31)blend(3,airIndex,smooth((t-.16)/.15));
   else if(t<.7)weights[airIndex]=1;
   else if(t<.87)blend(airIndex,3,smooth((t-.7)/.17));
   else blend(3,0,smooth((t-.87)/.13));
  }
  castBlend(0,weights,rabbitBuffer,p.x+f.x+shake,p.y-54+f.y+dip-lift-happy,142,options);
  if(freeze){
   const a=motion.matches?.45:.3+Math.sin(now/250)*.12;
   ellipse(p.x,p.y-40,43,54,`rgba(227,249,255,${a})`,1.8);
   if(!motion.matches)for(let i=0;i<4;i++){const ang=now/1800+i*TAU/4;ctx.fillStyle='#edf9ec';ctx.fillRect(p.x+Math.cos(ang)*41-1.5,p.y-40+Math.sin(ang)*49-1.5,3,3)}
  }
 }
 function paintEffects(now){
  if(motion.matches)return;
  ripples=ripples.filter(r=>now-r.at<1600);
  for(const r of ripples){const t=(now-r.at)/1600;for(let j=0;j<2;j++)ellipse(r.x,r.y+8,(18+t*52+j*12)*r.strength,(5+t*15+j*4)*r.strength,`rgba(237,250,208,${(1-t)*.55})`,1.5)}
  splashes=splashes.filter(p=>now-p.at<p.life);
  for(const p of splashes){const age=now-p.at;ctx.fillStyle=`rgba(236,249,210,${1-age/p.life})`;ctx.beginPath();ctx.ellipse(p.x+p.vx*age*.18,p.y+p.vy*age+age*age*.00042,1.5,2.7,0,0,TAU);ctx.fill()}
  for(const p of fireflies){const x=p.x+Math.sin(now/2300+p.phase)*17,y=p.y+Math.cos(now/1800+p.phase)*9;ctx.fillStyle=`rgba(255,245,176,${(.2+(Math.sin(natureTime/900+p.phase)+1)*.22)*(focused?.3:1)})`;ctx.shadowColor='#fff0a4';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y,2,0,TAU);ctx.fill();ctx.shadowBlur=0}
  if(now-celebratedAt<3200){const age=now-celebratedAt;for(let i=0;i<22;i++){const ang=i*2.4,r=age*.035+(i%4)*9;ctx.globalAlpha=Math.max(0,1-age/3200);ctx.fillStyle=i%2?'#fff4a5':'#e3eebe';ctx.save();ctx.translate(fox.x+Math.cos(ang)*r,fox.y-45+Math.sin(ang)*r-age*.02);ctx.rotate(age/500+i);ctx.fillRect(-2,-2,4,4);ctx.restore()}ctx.globalAlpha=1}
 }
 function paintSurprise(now){
  if(!surpriseType)return;
  const age=motion.matches?1100:(now-surpriseAt)%6500;
  if(age>4500&&surpriseType!=='fireflies')return;
  const fade=surpriseType==='fireflies'?Math.min(1,age/400):Math.min(1,age/400,Math.max(0,(4500-age)/650));
  const p=position(now);
  ctx.save();ctx.globalAlpha=fade;
  if(surpriseType==='fireflies'){
   const goal=guidePoint||to;
   ctx.save();ctx.strokeStyle='#fff0a37a';ctx.lineWidth=1.4;ctx.setLineDash([4,7]);ctx.beginPath();ctx.moveTo(p.x,p.y-30);ctx.quadraticCurveTo((p.x+goal.x)/2,(p.y+goal.y)/2-40,goal.x,goal.y-8);ctx.stroke();ctx.restore();
   ellipse(goal.x,goal.y,44+Math.sin(age/220)*3,17+Math.sin(age/220),`rgba(255,237,143,${.7*fade})`,3);
   for(let i=0;i<19;i++){
    const q=motion.matches?i/19:(age/2000+i/19)%1;
    const x=p.x+(goal.x-p.x)*q+Math.sin(i*2.4+age/400)*4;
    const y=p.y-30+(goal.y-p.y+22)*q-Math.sin(q*Math.PI)*27+Math.cos(i*2.4+age/400)*4;
    ctx.shadowBlur=14;ctx.shadowColor='#fff4a0';ctx.fillStyle='#fff5b9';ctx.beginPath();ctx.arc(x,y,2.4,0,TAU);ctx.fill();
   }
  }else if(surpriseType==='fish'&&fishReady){
   for(let i=0;i<2;i++){
    const t=((age+i*670)%2100)/2100,arc=Math.sin(t*Math.PI);
    const x=430+i*110+(t-.5)*70,y=365+i*40-arc*75;
    drawSwimmingFish(i?3:0,x,y,82-i*10,(t-.5)*1.4,age/120+i,arc*fade);
   }
  }else if(surpriseType==='fox'){
   for(let i=0;i<9;i++){
    const angle=i*2.4+age/1300;
    const x=fox.x+58+Math.cos(angle)*48,y=fox.y-60+Math.sin(angle)*42;
    ctx.fillStyle='#fff5b9';ctx.shadowBlur=10;ctx.shadowColor='#fff1a0';ctx.fillRect(x-1.5,y-1.5,3,3);
   }
  }
  ctx.restore();
 }
 function frame(now){
  const dt=lastFrame?Math.min(60,now-lastFrame):0;frameDt=dt||16;lastFrame=now;if(!document.hidden)natureTime+=dt*(focused?.18:1);
  if(ready&&!document.hidden){
   ctx.clearRect(0,0,860,600);ctx.drawImage(chapter===1&&moonReady?moon:background,0,0,860,600);paintWater(natureTime);paintFish(natureTime,now);paintStones(now);
   const p=position(now);if(p.y>fox.y-10){paintFox(now);paintRabbit(now)}else{paintRabbit(now);paintFox(now)}paintEffects(now);paintSurprise(now);
  }
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 return {
  reset(points){stones=points.filter((p,i,a)=>a.findIndex(v=>v.x===p.x&&v.y===p.y)===i);fox=points.at(-1);from={...points[0]};to={...from};started=performance.now()-1000;pose='';facing='right';fishDisturbance=null;guidePoint=null;foxReactAt=-Infinity;foxWeights=[1,0,0,0];foxGreetBefore=false;landCount=0;surpriseType=null;ripples=[];splashes=[];landingAt=0;celebratedAt=-Infinity;},
  move(p,cmd){const now=performance.now();from=position(now);facing=moveDirection(from,p);to={...p};started=now;duration=cmd==='bum'?800:550;pose=cmd==='bum'?'jumping':'hopping';poseAt=now;landingAt=now+duration;},
  pose(name){pose=name;poseAt=performance.now()},
  land(big=false){const now=performance.now();splash(to.x,to.y,now,big);landCount++;if(landCount%3===0)foxReactAt=now},
  celebrate(){celebratedAt=performance.now()},
  touch(x,y){const now=performance.now();splash(x,y,now,false);fishDisturbance={x,y,at:now};if(Math.hypot(x-fox.x-58,y-fox.y+40)<80)foxReactAt=now},
  focus(value){focused=value},
  setChapter(value){chapter=value},
  guideTo(point){guidePoint=point},
  surprise(type){surpriseType=type;surpriseAt=performance.now();if(type==='fish'){splash(430,365,surpriseAt,true);splash(540,405,surpriseAt,true)}}
 };
}
