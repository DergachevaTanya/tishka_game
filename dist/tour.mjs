export function createTour(){
 const byId=id=>document.getElementById(id),layer=byId('tour-layer'),card=byId('tour-card');
 const steps=[
  {id:'story-banner',title:'История и подарки',text:'Здесь цель текущей тропы и подарки за пройденные уровни. Рядом — озвучка истории. Зайчонок ниже обращается к ребёнку: можно ответить ему кнопкой.'},
  {id:'route-panel',title:'Маршрут и начало хода',text:'Прочитайте слова или нажмите озвучку. «Я готов!» начинает ход и скрывает слова в режиме памяти. Ребёнок называет команды, вы нажимаете кнопки.'},
  {id:'commands',title:'Кнопки языка троллей',text:'Трям — шаг вперёд, Бум — прыжок, Ля — вправо, Оп — влево, Бах — замереть на пять счётов. Кнопки активны во время хода. Вперёд означает к верхнему краю поля.'},
  {id:'lesson-settings',title:'Настройте занятие здесь',text:'Блок уже раскрыт. Можно оставить маршрут открытым, отключить сюрпризы, включить голос Тишки и указать имя ребёнка. Настройки в подсвеченном блоке можно менять прямо сейчас.'},
  {id:'trail-selector',title:'Главы и уровни',text:'Здесь две главы и десять троп. Глава 2 — новая локация и маршруты по 6–8 слов. Нажмите главу или номер уровня, чтобы выбрать его; текущая попытка начнётся заново.'},
  {id:'sound',title:'Звуки болота и речки',text:'Эту кнопку можно нажать прямо сейчас: она включает или выключает звуки. Громкость — в настройках занятия. Для видеосвязи передайте звук компьютера в программе звонка.'}
 ];
 let index=-1,target=null,raf=0,returnFocus=null;
 function rect(el,x,y,w,h){Object.assign(el.style,{left:x+'px',top:y+'px',width:Math.max(0,w)+'px',height:Math.max(0,h)+'px'})}
 function position(){
  if(index<0||!target)return;
  const r=target.getBoundingClientRect(),w=window.innerWidth,h=window.innerHeight;
  const left=Math.max(6,Math.min(w-6,r.left-8)),right=Math.min(w-6,Math.max(6,r.right+8));
  const top=Math.max(6,Math.min(h-6,r.top-8)),bottom=Math.min(h-6,Math.max(6,r.bottom+8));
  rect(byId('tour-top-shade'),0,0,w,top);rect(byId('tour-bottom-shade'),0,bottom,w,h-bottom);
  rect(byId('tour-left-shade'),0,top,left,bottom-top);rect(byId('tour-right-shade'),right,top,w-right,bottom-top);
  rect(byId('tour-spotlight'),left,top,right-left,bottom-top);
  const cw=Math.min(320,w-24);card.style.width=cw+'px';
  const ch=card.getBoundingClientRect().height;
  let x,y;
  if(w>950&&right+cw+20<w){x=right+16;y=Math.max(12,Math.min(h-ch-12,top))}
  else if(w>950&&left-cw-20>0){x=left-cw-16;y=Math.max(12,Math.min(h-ch-12,top))}
  else{x=Math.max(12,Math.min(w-cw-12,left));y=bottom+14+ch<h?bottom+14:top-ch-14>12?top-ch-14:h-ch-12;}
  card.style.left=x+'px';card.style.top=Math.max(12,y)+'px';
 }
 function schedule(){if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(position)}
 function show(n){
  index=Math.max(0,Math.min(steps.length-1,n));const step=steps[index];
  target=byId(step.id);if(!target){end();return}
  if(target.tagName==='DETAILS')target.open=true;
  byId('tour-counter').textContent=`Шаг ${index+1} из ${steps.length}`;byId('tour-title').textContent=step.title;byId('tour-text').textContent=step.text;
  byId('tour-prev').disabled=index===0;byId('tour-next').textContent=index===steps.length-1?'Готово ✓':'Дальше →';
  layer.hidden=false;document.body.classList.add('touring');
  target.scrollIntoView({behavior:'auto',block:'center'});position();schedule();byId('tour-next').focus({preventScroll:true});
 }
 function end(){index=-1;layer.hidden=true;document.body.classList.remove('touring');target=null;returnFocus?.focus({preventScroll:true})}
 byId('tour-next').onclick=()=>index===steps.length-1?end():show(index+1);
 byId('tour-prev').onclick=()=>show(index-1);byId('tour-exit').onclick=end;
 window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,true);document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);document.addEventListener('toggle',schedule,true);
 document.addEventListener('keydown',e=>{
  if(index<0)return;
  if(e.key==='Escape'){e.preventDefault();end();return}
  if(e.key==='Tab'){
   const selector='button:not([disabled]),input:not([disabled]),summary,a[href]';
   const all=[...target.querySelectorAll(selector),...(target.matches(selector)?[target]:[]),...card.querySelectorAll(selector)].filter(el=>el.getClientRects().length);
   const current=all.indexOf(document.activeElement),next=(current+(e.shiftKey?-1:1)+all.length)%all.length;
   e.preventDefault();all[next]?.focus();
  }
 },true);
 return {get active(){return index>=0},start(step=0){returnFocus=byId('teacher-top');show(typeof step==='string'?Math.max(0,steps.findIndex(s=>s.id===step)):step)},end};
}
