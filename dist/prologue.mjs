import {COMMANDS} from './engine.mjs';
import {asset} from './assets.mjs';

export function createPrologue({speak,stop,onFinish}){
 const byId=id=>document.getElementById(id),dialog=byId('prologue-dialog');
 const pages=[
  {title:'Тишка заблудился',body:'<p>Однажды зайчонок Тишка отправился гулять в лес. Он засмотрелся на светлячков и не заметил, как оказался посреди болота.</p><p>Теперь Тишка сидит на маленьком островке. Вокруг вода и вязкая трясина, а на другом берегу его ждёт друг Лисёнок.</p><p class="prologue-question">Поможешь Тишке найти дорогу?</p>',next:'Поможем Тишке'},
  {title:'Секретная тропа троллей',body:'<p>Через болото ведёт волшебная тропа. Камни появляются над водой, если правильно следовать подсказкам.</p><p>Но тролли записали маршрут на своём языке! Тишка пока его не знает. Давай выучим пять слов и будем подсказывать зайчонку, куда идти.</p><p class="prologue-question">Ты называешь команды — Тишка шагает и прыгает.</p>',next:'Выучим слова'},
  {title:'Пять волшебных слов',body:'<p>Повтори слова вместе с ведущим. Можно нажать на слово, чтобы услышать его значение.</p><div class="prologue-words">'+Object.entries(COMMANDS).map(([key,c])=>`<button data-learn="${key}"><b>${c.word}</b><span>${c.label}</span></button>`).join('')+'</div><p>Вперёд — к верхнему краю поля. Если услышишь «Трям, Трям», сделай два шага вперёд. Три одинаковых слова — три действия.</p>',next:'Я запомнил!'},
  {title:'Мы справимся вместе',body:'<p>Сначала послушай или прочитай весь маршрут. Когда запомнишь слова, нажми «Я готов!» и повтори команды по порядку.</p><p>У Тишки три волшебных сердечка. За ошибку исчезает одно. Если сердечки закончатся, они вернутся, и можно попробовать тропу сначала.</p><p class="prologue-question">Не торопись: Тишка подождёт. Лисёнок уже машет нам с другого берега!</p>',next:'Отправиться в путь'}
 ];
 let page=0,returnFocus=null;
 dialog.querySelector('.prologue-art').style.backgroundImage=`url("${asset('swamp-watercolor.png')}")`;
 function pageText(){const body=byId('prologue-body').innerText;return pages[page].title+'. '+body}
 function render(){stop();const item=pages[page];byId('prologue-counter').textContent=`Начало сказки · ${page+1} из ${pages.length}`;byId('prologue-title').textContent=item.title;byId('prologue-body').innerHTML=item.body;byId('prologue-next').textContent=item.next;byId('prologue-back').hidden=page===0;dialog.scrollTop=0;byId('prologue-title').focus({preventScroll:true})}
 function finish(){dialog.close();returnFocus?.focus({preventScroll:true});onFinish?.()}
 byId('prologue-next').onclick=()=>{if(page===pages.length-1)finish();else{page++;render()}};
 byId('prologue-back').onclick=()=>{if(page>0){page--;render()}};
 byId('prologue-read').onclick=()=>speak(pageText());
 byId('prologue-skip').onclick=finish;
 byId('prologue-body').onclick=e=>{const button=e.target.closest('[data-learn]');if(!button)return;const command=COMMANDS[button.dataset.learn];speak(command.word+'. '+command.label)};
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish()});
 dialog.addEventListener('close',stop);
 return {open(){stop();returnFocus=document.activeElement;page=0;if(!dialog.open)dialog.showModal();render()}};
}
