export const COMMANDS = {
 trjam:{word:'Трям',label:'Шаг вперёд',icon:'up',key:'ArrowUp',dx:0,dy:-1},
 bum:{word:'Бум',label:'Прыжок вперёд',icon:'jump',key:' ',dx:0,dy:-2},
 lya:{word:'Ля',label:'Шаг вправо',icon:'right',key:'ArrowRight',dx:1,dy:0},
 op:{word:'Оп',label:'Шаг влево',icon:'left',key:'ArrowLeft',dx:-1,dy:0},
 bah:{word:'Бах',label:'Замри на 5 счётов',icon:'wait',key:'ArrowDown',dx:0,dy:0}
};
export const LEVELS = [
 {name:'Первые шаги',hint:'Познакомимся с волшебными словами',rounds:[['trjam','trjam'],['lya','lya'],['trjam','trjam'],['lya','trjam']]},
 {name:'Большой прыжок',hint:'Перепрыгнем через кочки',rounds:[['bum','lya'],['trjam','op','trjam'],['lya','lya','bum']]},
 {name:'Тихое болото',hint:'Иногда нужно просто замереть',rounds:[['trjam','bah','lya'],['bum','lya','bah'],['op','trjam','trjam'],['lya','lya','trjam']]},
 {name:'Хитрая тропинка',hint:'Слушай внимательно: слова повторяются',rounds:[['lya','lya','trjam','trjam'],['op','bah','op','trjam'],['bum','lya','lya','lya']]},
 {name:'Знаток языка',hint:'Последняя тропа к Лису',rounds:[['trjam','trjam','lya','lya','bah'],['op','bum','op','bah','bah'],['lya','lya','lya','trjam','trjam']]},
 {name:'Лунный берег',hint:'Шесть слов — слушай весь маршрут',rounds:[['lya','trjam','lya','bah','lya','trjam'],['op','op','bah','op','bah','bah'],['bum','lya','trjam','lya','trjam','lya']]},
 {name:'Шёпот камышей',hint:'Повторы и прыжки: до семи слов',rounds:[['trjam','lya','trjam','lya','bah','bah'],['op','bum','op','bah','op','bah'],['lya','lya','trjam','lya','trjam','bah','bah']]},
 {name:'Мостик отражений',hint:'Семь слов и смена направлений',rounds:[['lya','lya','bah','trjam','lya','trjam','bah'],['op','op','bah','bum','op','bah','bah'],['lya','trjam','lya','bah','trjam','lya','bah']]},
 {name:'Огоньки над рекой',hint:'До восьми слов: держим порядок в памяти',rounds:[['trjam','lya','lya','bah','trjam','lya','bah'],['op','bah','op','bum','bah','op','bah','bum'],['lya','op','lya','bah','lya','op','bah','op']]},
 {name:'Лунный маяк',hint:'Три больших маршрута по восемь слов',rounds:[['lya','trjam','bah','lya','trjam','lya','bah','trjam'],['op','bah','trjam','op','bah','op','trjam','trjam'],['lya','bah','op','lya','op','bah','lya','op']]}

];
export const CHAPTERS=[
 {id:0,title:'Волшебное болото',short:'Болото',start:0,count:5,subtitle:'Глава 1 · Первые приключения'},
 {id:1,title:'Лунная речка',short:'Лунная речка',start:5,count:5,subtitle:'Глава 2 · Большое путешествие'}
];
export function chapterFor(level){return CHAPTERS.find(c=>level>=c.start&&level<c.start+c.count)||CHAPTERS[0]}
export function routeFor(level){let pos={x:1,y:6};const points=[{...pos}];for(const cmd of LEVELS[level].rounds.flat()){const c=COMMANDS[cmd];pos={x:pos.x+c.dx,y:pos.y+c.dy};points.push({...pos});}return points;}
export class Game{
 constructor(level=0){this.reset(level)}
 reset(level=0){this.level=level;this.round=0;this.step=0;this.lives=3;this.position={x:1,y:6};this.status='ready';this.mistakes=0;this.completed=0;}
 get sequence(){return LEVELS[this.level].rounds[this.round]||[]}
 get total(){return LEVELS[this.level].rounds.flat().length}
 start(){if(this.status==='ready')this.status='playing'}
 act(cmd){if(this.status!=='playing')return 'ignored';if(cmd!==this.sequence[this.step]){this.lives--;this.mistakes++;if(this.lives===0)this.status='lost';return 'wrong';}const c=COMMANDS[cmd];this.position={x:this.position.x+c.dx,y:this.position.y+c.dy};this.step++;this.completed++;if(this.step===this.sequence.length){this.round++;this.step=0;this.status=this.round===LEVELS[this.level].rounds.length?'won':'ready';}return 'correct';}
}
