import {Game,COMMANDS,LEVELS,routeFor,CHAPTERS,chapterFor} from './engine.mjs';
import {createScene} from './scene.mjs';
import {createSound} from './audio.mjs';
import {STORIES,interludeFor} from './story.mjs';
import {createTour} from './tour.mjs';
import {inkIcon,charm,portrait,installArt} from './icons.mjs';
import {createSpeech} from './speech.mjs';
import {createPrologue} from './prologue.mjs';
const $=s=>document.querySelector(s), game=new Game();
let busy=false, generation=0, translated=true, sound=true, audioStarted=false, interlude=null, lesson=null, completed=new Set();
let welcomed=false,dialogueAction='help',displayedChapter=-1;
try{completed=new Set(JSON.parse(localStorage.getItem('troll-trail-completed')||'[]'))}catch{}
const xy=p=>({x:160+p.x*102,y:140+p.y*54});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const scene=createScene($('#landscape'),$('#art-loading'));
const audio=createSound(),tour=createTour();
installArt();
const speech=createSpeech({onStart:()=>audio.duck(true),onEnd:()=>audio.duck(false),onUnavailable:()=>feedback('Не удалось озвучить. Можно прочитать текст вслух.')});
$('.brand-icon').innerHTML=inkIcon('leaf');$('#help').innerHTML='Как играть '+inkIcon('help');$('#teacher').textContent='Памятка ведущему';$('#help-dialog .close').innerHTML=inkIcon('close');$('.companion-avatar').innerHTML=portrait('rabbit');$('.first-visit-art').innerHTML=inkIcon('book');$('.lesson-badge').innerHTML=inkIcon('help');
for(const [id,icon] of [['sound','sound'],['speak','voice'],['story-read','voice'],['rabbit-voice','voice'],['restart','restart'],['teacher-close','close'],['tour-exit','close'],['first-close','close']])document.getElementById(id).innerHTML=inkIcon(icon);
for(const el of document.querySelectorAll('.instruction-leaf,.teacher-leaf'))el.innerHTML=inkIcon('leaf');
$('#hearts').innerHTML=Array.from({length:3},()=>'<span class="heart-shell" aria-hidden="true"><i class="gem-heart"></i></span>').join('');
$('#landscape').addEventListener('pointerdown',e=>{if(game.status==='playing')return;const rect=e.currentTarget.getBoundingClientRect();scene.touch((e.clientX-rect.left)*860/rect.width,(e.clientY-rect.top)*600/rect.height);audio.play('bubble')});
function drawMap(){audio.setChapter(chapterFor(game.level).id);scene.setChapter(chapterFor(game.level).id);scene.reset(routeFor(game.level).map(xy))}
function render(){
 const blocked=!!interlude||!!lesson;
 const quiet=!blocked&&(game.status==='ready'||game.status==='playing');scene.focus(quiet);audio.focus(quiet);
 renderStory();renderLevels();renderInterlude();$('#story-read').disabled=game.status==='playing'||busy;
 const def=LEVELS[game.level];$('#level-title').textContent=def.name;$('#level-hint').textContent=def.hint;
 $('#map-level').textContent=`Тропа ${String(game.level+1).padStart(2,'0')} / ${LEVELS.length}`;$('#location-name').textContent=chapterFor(game.level).title.toUpperCase();$('#landscape').setAttribute('aria-label',chapterFor(game.level).title+': зайчонок идёт по камням к Лисёнку');document.body.classList.toggle('moon-chapter',game.level>=5);
 $('#round').textContent=`${String(Math.min(game.round+1,def.rounds.length)).padStart(2,'0')} / ${String(def.rounds.length).padStart(2,'0')}`;
 $('#hearts').querySelectorAll('.heart-shell').forEach((heart,i)=>heart.classList.toggle('spent',i>=game.lives));$('#hearts').setAttribute('aria-label',`${game.lives} жизни`);
 const percent=Math.round(game.completed/game.total*100);$('#progress-label').textContent=percent+'%';$('#progress').style.width=percent+'%';
 const hidden=game.status==='playing'&&$('#memory').checked;
 $('#sequence').classList.toggle('hidden',hidden);$('#sequence').setAttribute('aria-label',hidden?'Маршрут скрыт':game.sequence.map(k=>COMMANDS[k].word).join(', '));
 $('#sequence').innerHTML=game.sequence.map((k,i)=>`<span class="${i<game.step?'done':''}" aria-hidden="true">${COMMANDS[k].word}</span>`).join('');
 $('#instruction-label').textContent=interlude?'МАЛЕНЬКОЕ ОТКРЫТИЕ':lesson?'ПОМОГИ ТИШКЕ':game.status==='playing'?'ТЕПЕРЬ ТВОЙ ХОД':'ЗАПОМНИ МАРШРУТ';
 $('#instruction-text').textContent=game.status==='playing'?(hidden?'Вспомни слова и выбери команды ниже':'Выполни команды по порядку'):game.round?'Отлично! Запомни следующий отрезок пути.':'Прочитай слова, затем нажми «Я готов!»';
 $('#start').disabled=game.status!=='ready'||busy||blocked;$('#start').innerHTML=game.status==='playing'?'Зайчонок ждёт твою команду <span>↓</span>':'Я готов! <span>→</span>';
 for(const btn of document.querySelectorAll('.command'))btn.disabled=game.status!=='playing'||busy||blocked;
 $('#speak').disabled=hidden||busy||blocked;$('#speak').style.opacity=hidden||blocked?'.3':'1';
 $('#route-content').hidden=blocked||(game.status==='ready'&&busy);
 document.querySelectorAll('.level-button').forEach(b=>{const level=Number(b.dataset.level),done=completed.has(level),current=level===game.level;b.classList.toggle('selected',current);b.classList.toggle('completed',done);b.setAttribute('aria-pressed',String(current));b.setAttribute('aria-label',`Тропа ${level+1}: ${LEVELS[level].name}${done?' — пройдена':''}${current?' — выбрана':''}`);if(current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');b.querySelector('.level-status').textContent=done?(current?'Пройдено · вы здесь':'Пройдено'):(current?'Вы здесь':'Начать');b.querySelector('.level-check').hidden=!done});
 const chapter=chapterFor(game.level),doneCount=Array.from({length:chapter.count},(_,i)=>chapter.start+i).filter(i=>completed.has(i)).length;
 $('#chapter-progress').textContent=`Пройдено ${doneCount} из ${chapter.count} троп`;
}
function childName(){return $('#child-name').value.trim()}
function addressed(text){const name=childName();return name?`${name}, ${text.charAt(0).toLocaleLowerCase('ru')+text.slice(1)}`:text}
function setRabbit(text,reply='',action='',announce=false){
 $('#rabbit-line').textContent=text;$('#rabbit-reply').hidden=!reply;$('#rabbit-reply').textContent=reply;dialogueAction=action;
 if(announce&&$('#rabbit-talk').checked)speakText(text,true);
}
function readyRabbit(){
 if(!welcomed)setRabbit(`Привет${childName()?', '+childName():''}! Я Тишка. Поможешь мне добраться к Лисёнку?`,'Я помогу!','help');
 else setRabbit(addressed(game.level>=5?'Мы у Лунной речки! Поможешь мне запомнить длинный маршрут?':'Посмотри на слова. Когда запомнишь их, я готов отправиться в путь!'),'Я готов!','start');
}
function renderLevels(){
 const chapter=chapterFor(game.level);
 if(displayedChapter!==chapter.id){
  displayedChapter=chapter.id;
  $('#levels').innerHTML=LEVELS.slice(chapter.start,chapter.start+chapter.count).map((l,j)=>{const i=chapter.start+j;return `<button class="level-button" data-level="${i}" title="${l.name}" aria-label="Тропа ${i+1}: ${l.name}" aria-pressed="false"><span class="level-number">${i+1}</span><span class="level-name">${l.name}</span><span class="level-status"></span><span class="level-check" hidden aria-hidden="true">${inkIcon('check')}</span></button>`}).join('');
 }
 document.querySelectorAll('.chapter-button').forEach((b,i)=>{b.classList.toggle('selected',i===chapter.id);b.setAttribute('aria-pressed',i===chapter.id)});
}
function renderStory(){
 const story=STORIES[game.level],chapter=chapterFor(game.level);$('#story-icon').innerHTML=charm(game.level);$('#story-title').textContent=story.title;$('#story-intro').textContent=story.intro;
 $('#chapter-eyebrow').textContent=`ГЛАВА ${chapter.id+1} · ${chapter.title.toUpperCase()}`;
 const count=STORIES.slice(chapter.start,chapter.start+chapter.count).filter((_,i)=>completed.has(chapter.start+i)).length;
 $('#collection-count').textContent=`Подарки главы · ${count} / ${chapter.count}`;
 $('#collection-items').innerHTML=STORIES.slice(chapter.start,chapter.start+chapter.count).map((gift,j)=>{const i=chapter.start+j;return `<span class="gift-token ${completed.has(i)?'earned':''}" role="img" aria-label="${gift.gift}: ${completed.has(i)?'уже найдён':'ещё впереди'}" title="${gift.gift}">${charm(i)}</span>`}).join('');
}
function nextStone(){
 const command=game.sequence.find(k=>COMMANDS[k].dx||COMMANDS[k].dy);const c=COMMANDS[command]||{dx:0,dy:0};return xy({x:game.position.x+c.dx,y:game.position.y+c.dy});
}
function renderInterlude(){
 $('#interlude').hidden=!interlude;$('#event-callout').hidden=!interlude;$('#light-marker').hidden=interlude?.type!=='fireflies';if(interlude?.type==='fireflies'){const p=nextStone();$('#light-marker').style.left=p.x/860*100+'%';$('#light-marker').style.top=p.y/600*100+'%';}
 if(!interlude)return;
 $('#event-callout-title').textContent=interlude.title;$('#event-icon').innerHTML=interlude.type==='fox'?portrait('fox'):interlude.type==='fireflies'?charm(10):inkIcon('fish');$('#event-title').textContent=interlude.title;$('#event-text').textContent=interlude.text;
}
function beginInterlude(){
 if(!$('#events').checked){setRabbit(addressed('Получилось! Теперь запомним следующий маршрут. Я подожду, пока ты будешь готов.'),'Я готов!','start',true);return;}
 const event=interludeFor(game.level,game.round,LEVELS[game.level].rounds.length);
 if(!event)return;
 if(event.kind==='lesson'){
  lesson={...event,solved:false};scene.pose('thinking');setRabbit(addressed('Поможешь мне вспомнить, что означает это слово?'),'','',true);
  $('#lesson-claim').textContent=`На табличке написано «${event.word}». Тишка не уверен, что это значит. Поможешь выбрать верное действие?`;
  $('#lesson-options').innerHTML=event.options.map(k=>`<button class="lesson-option" data-answer="${k}">${COMMANDS[k].label}</button>`).join('');
  $('#lesson-feedback').textContent='Помоги зайчонку вспомнить. Здесь жизни не теряются.';$('#lesson-next').hidden=true;$('#lesson-skip').hidden=false;
  $('#lesson-dialog').showModal();
 }else{interlude=event;if(event.type==='fireflies')scene.guideTo(nextStone());scene.surprise(event.type);audio.play('ready');feedback('Маленькая передышка. Посмотрите, кто нам встретился!');setRabbit(addressed(event.type==='fireflies'?'Огоньки летят к следующему камню. Покажи его пальцем — туда мы пойдём дальше!':event.type==='fish'?'Смотри, рыбки здороваются! Помашем им вместе?':'Лисёнок машет нам! Помаши ему в ответ.'),event.type==='fireflies'?'Вижу камень!':'Помахали, идём!','event',true);}
}
function finishInterlude(){interlude=null;scene.surprise(null);scene.guideTo(null);setRabbit(addressed('Спасибо! Теперь запомним следующий кусочек пути.'),'Я готов!','start');feedback('Теперь запомним следующий кусочек пути.');render()}
function closeLesson(){const solved=lesson?.solved;stopSpeech();$('#lesson-dialog').close();lesson=null;scene.pose('');setRabbit(addressed(solved?'Спасибо, что научил меня! Готов к следующему маршруту?':'Давай дальше вместе. Посмотрим на следующий маршрут?'),'Я готов!','start',true);feedback(solved?'Спасибо за помощь! Продолжим путь.':'Продолжим путь. Следующий маршрут уже готов.',solved?'success':'');render()}
function answerLesson(answer){
 if(!lesson||lesson.solved)return;
 const correct=answer===lesson.correct;
 const btn=$('#lesson-options').querySelector(`[data-answer="${answer}"]`);
 if(correct){
  lesson.solved=true;btn.classList.add('correct');for(const b of $('#lesson-options').querySelectorAll('button'))b.disabled=true;
  $('#lesson-feedback').textContent=`Точно! «${lesson.word}» — ${COMMANDS[lesson.correct].label.toLowerCase()}. Спасибо, что научил меня!`;
  $('#lesson-next').hidden=false;$('#lesson-skip').hidden=true;scene.pose('');audio.play('ready');$('#lesson-next').focus();
 }else{
  btn.classList.add('incorrect');$('#lesson-feedback').textContent=`Давай вспомним вместе: «${lesson.word}» — ${COMMANDS[lesson.correct].label.toLowerCase()}. Попробуй выбрать ещё раз.`;audio.play('bubble');
 }
}
function feedback(msg,cls=''){const el=$('#feedback');el.className='feedback '+cls;el.innerHTML='<span>'+inkIcon(cls==='success'?'check':cls==='error'?'help':'leaf')+'</span>';el.append(document.createTextNode(msg))}
function stopSpeech(){speech.stop()}
function reset(level=game.level){generation++;busy=false;stopSpeech();game.reset(level);interlude=null;lesson=null;$('#lesson-dialog').close();scene.surprise(null);scene.guideTo(null);scene.pose('');readyRabbit();$('#count-bubble').hidden=true;$('#result-dialog').close();feedback('Здесь можно пробовать и ошибаться');drawMap();render()}
async function act(cmd){if(busy||interlude||lesson||game.status!=='playing')return;stopSpeech();const expected=game.sequence[game.step],token=generation;busy=true;
 if(cmd==='bah'&&expected==='bah'){const b=$('#count-bubble');scene.pose('frozen');setRabbit('Замри вместе со мной! Сосчитаем до пяти…');audio.play('freeze');render();for(let n=5;n>0;n--){if(token!==generation)return;b.textContent=n;b.hidden=false;feedback(`Замри… считаем: ${6-n} из 5`);audio.play('tick');await delay(1000)}if(token!==generation)return;b.hidden=true;}
 const beforeRound=game.round;
 const outcome=game.act(cmd);
 if(outcome==='wrong')setRabbit(addressed('Кажется, я запутался. Давай вместе вспомним следующее слово?'),'','',true);else setRabbit(cmd==='bah'?'Мы отлично замерли вместе! Теперь слушаю следующую команду.':'Получилось! Я слушаю тебя: какое слово дальше?');
 if(outcome==='wrong'){scene.pose('wrong');audio.play('wrong')}
 else if(cmd!=='bah'){scene.move(xy(game.position),cmd);audio.play(cmd==='bum'?'jump':'step')}
 else scene.pose('');
 if(outcome==='correct'){feedback(cmd==='bah'?'Получилось! Можно двигаться дальше.':'Верно! Тишка всё ближе к другу.','success')}else feedback(game.status==='lost'?'Жизни закончились. Попробуем снова!':'Ой! Вспомни следующую команду и попробуй ещё раз.','error');
 render();await delay(cmd==='bum'?800:550);if(token!==generation)return;
 if(outcome==='correct'&&cmd!=='bah'){scene.land(cmd==='bum');audio.play(cmd==='bum'?'splash':'land')}
 scene.pose('');busy=false;
 if(game.status==='won'||game.status==='lost')showResult();
 else if(game.round>beforeRound)beginInterlude();
 render();
}
function showResult(){const won=game.status==='won';setRabbit(addressed(won?'Спасибо! С тобой я добрался до друга. Ты мне очень помог!':'Я буду рядом. Давай начнём ещё раз — вместе получится!'),'','',true);audio.play(won?'win':'lose');if(won)scene.celebrate();if(won){completed.add(game.level);try{localStorage.setItem('troll-trail-completed',JSON.stringify([...completed]))}catch{}}
 $('#result-icon').innerHTML=won?charm(game.level):inkIcon('leaf');$('#result-eyebrow').textContent=won?'ДРУЗЬЯ СНОВА ВМЕСТЕ':'У НАС ВСЁ ПОЛУЧИТСЯ';$('#result-title').textContent=won?'Вот и Лис!':'Попробуем ещё раз?';$('#result-text').textContent=won?STORIES[game.level].ending:'Три волшебные жизни вернутся, а зайчонок начнёт путь сначала. Можно оставить маршрут открытым — так будет легче.';
 const story=STORIES[game.level];$('#result-gift').hidden=!won;$('#result-gift').innerHTML=won?`<span>${charm(game.level)}</span><b>${story.gift} для поляны</b><small>${STORIES.slice(chapterFor(game.level).start,chapterFor(game.level).start+5).filter((_,i)=>completed.has(chapterFor(game.level).start+i)).length===5?'Все подарки этой главы собраны!':'Подарок сохранён в твоей коллекции'}</small>`:'';
 $('#next-level').textContent=!won?'Начать заново →':game.level===4?'Открыть главу 2 →':game.level===LEVELS.length-1?'Снова в Болото →':'Следующая история →';$('#replay').hidden=!won;$('#result-dialog').showModal();render();}
$('#commands').innerHTML=Object.entries(COMMANDS).map(([id,c])=>`<button class="command" data-command="${id}" disabled aria-label="${c.word}: ${c.label}"><span><b>${c.word}</b><small>${c.label}</small></span></button>`).join('');
$('#chapters').innerHTML=CHAPTERS.map(c=>`<button class="chapter-button" data-chapter="${c.id}" aria-pressed="false">Глава ${c.id+1} · ${c.short}</button>`).join('');
$('#chapters').onclick=e=>{const b=e.target.closest('[data-chapter]');if(b)reset(CHAPTERS[Number(b.dataset.chapter)].start)};
$('.brand').onclick=e=>{e.preventDefault();reset(0)};
$('#commands').addEventListener('click',e=>{const b=e.target.closest('[data-command]');if(b)act(b.dataset.command)});
$('#levels').addEventListener('click',e=>{const b=e.target.closest('[data-level]');if(b)reset(Number(b.dataset.level))});
function startRound(){if(busy||interlude||lesson||game.status!=='ready')return;stopSpeech();audio.play('ready');welcomed=true;game.start();setRabbit(addressed('Я внимательно слушаю. Назови следующую команду!'));feedback('Твой ход! Выбери первую команду.');render()}
$('#start').onclick=startRound;
$('#restart').onclick=()=>reset();$('#next-level').onclick=()=>reset(game.status==='won'?(game.level+1)%LEVELS.length:game.level);$('#replay').onclick=()=>reset();
$('#memory').onchange=render;$('#hints').onclick=()=>{translated=!translated;document.querySelectorAll('.command').forEach(b=>b.classList.toggle('hide-label',!translated));$('#hints').textContent=translated?'Скрыть перевод':'Показать перевод'};
function renderSound(){const button=$('#sound');button.classList.toggle('active',sound);button.setAttribute('aria-label',sound?'Выключить звуки':'Включить звуки');button.setAttribute('aria-pressed',String(sound));button.title=sound?(audioStarted?'Музыка и звуки включены':'Музыка включена — начнётся после первого нажатия'):'Включить музыку и звуки'}
function startDefaultSound(e){if(!sound||audioStarted||e.target.closest?.('#sound')||e.type==='keydown'&&(['Shift','Control','Alt','Meta'].includes(e.key)||e.repeat))return;audioStarted=audio.enable(true);sound=audioStarted;renderSound()}
document.addEventListener('pointerdown',startDefaultSound,true);
document.addEventListener('keydown',startDefaultSound,true);
$('#sound').onclick=()=>{sound=audio.enable(!sound);audioStarted=sound;renderSound()};
renderSound();
$('#volume').oninput=e=>audio.setVolume(Number(e.target.value)/100);
function speakText(text,character=false){speech.speak(text,character)}
$('#voice-test').onclick=()=>speakText('Привет! Я Тишка. Давай вместе отправимся в маленькую сказку.',true);
$('#speak').onclick=()=>{if(interlude||lesson||busy||game.status==='playing'&&$('#memory').checked)return;speakText(game.sequence.map(k=>COMMANDS[k].word).join('… '))};
$('#story-read').onclick=()=>{if(game.status==='playing')return;speakText(STORIES[game.level].intro)};
$('#event-next').onclick=finishInterlude;$('#scene-event-next').onclick=finishInterlude;
$('#lesson-options').onclick=e=>{const b=e.target.closest('[data-answer]');if(b)answerLesson(b.dataset.answer)};
$('#lesson-next').onclick=closeLesson;$('#lesson-skip').onclick=closeLesson;
$('#lesson-dialog').addEventListener('close',()=>{if(lesson){lesson=null;scene.pose('');render()}});
$('#events').onchange=()=>{if(!$('#events').checked){if(lesson)closeLesson();else if(interlude)finishInterlude()}render()};
$('#rabbit-reply').onclick=()=>{if(busy||tour.active)return;if(dialogueAction==='help'){welcomed=true;setRabbit(addressed('Ура! Ты подсказываешь, а я прыгаю. Посмотри на слова и скажи, когда будешь готов.'),'Я готов!','start',true)}else if(dialogueAction==='start')startRound();else if(dialogueAction==='event')finishInterlude()};
$('#rabbit-voice').onclick=()=>speakText($('#rabbit-line').textContent,true);
$('#rabbit-talk').onchange=()=>{if($('#rabbit-talk').checked)speakText($('#rabbit-line').textContent,true)};
$('#child-name').oninput=()=>{if(game.status==='ready'&&!interlude&&!lesson)readyRabbit()};

function openTeacher(){stopSpeech();$('#teacher-dialog').showModal()}
$('#teacher-close').onclick=()=>$('#teacher-dialog').close();$('#teacher-done').onclick=()=>$('#teacher-dialog').close();
$('#teacher-rules').onclick=()=>{$('#teacher-dialog').close();help()};
function markTourSeen(){try{localStorage.setItem('troll-trail-tour-seen','1')}catch{}}
function dismissFirstVisit(){$('#first-visit').hidden=true;markTourSeen()}
$('#first-dismiss').onclick=dismissFirstVisit;$('#first-close').onclick=dismissFirstVisit;$('#first-tour').onclick=()=>{dismissFirstVisit();tour.start()};
$('#tour-start').onclick=()=>{dismissFirstVisit();$('#teacher-dialog').close();tour.start()};
$('#teacher-dialog').addEventListener('click',e=>{const button=e.target.closest('[data-guide-target]');if(!button)return;$('#teacher-dialog').close();dismissFirstVisit();tour.start(button.dataset.guideTarget)});
function help(){stopSpeech();$('#help-dialog').showModal()};$('#help').onclick=help;$('#teacher').onclick=openTeacher;$('#teacher-top').onclick=openTeacher;$('#help-dialog .close').onclick=()=>$('#help-dialog').close();$('.close-start').onclick=()=>$('#help-dialog').close();
window.addEventListener('keydown',e=>{if(e.repeat||tour.active||document.querySelector('dialog[open]')||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;const cmd=Object.keys(COMMANDS).find(k=>COMMANDS[k].key===e.key);if(cmd&&game.status==='playing'){e.preventDefault();act(cmd)}});
reset(0);
function offerTour(){try{$('#first-visit').hidden=localStorage.getItem('troll-trail-tour-seen')==='1'}catch{$('#first-visit').hidden=false}}
const prologue=createPrologue({speak:text=>speakText(text),stop:stopSpeech,onFinish:offerTour});
$('#prologue-open').onclick=()=>{$('#first-visit').hidden=true;prologue.open()};
prologue.open();
