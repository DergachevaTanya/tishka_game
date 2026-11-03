import {COMMANDS} from './engine.mjs';
export const STORIES=[
 {title:'Огонёк для Лиса',icon:0,gift:'Фонарик',intro:'У Лиса погас фонарик. Проведи Тишку через болото — светлячки помогут зажечь его снова.',ending:'Светлячки зажгли фонарик! Теперь на поляне Лиса тепло и светло.',lesson:'lya'},
 {title:'Угощение для друзей',icon:1,gift:'Ягоды',intro:'Свет уже есть! Теперь Тишка несёт Лису сладкие ягоды. Помоги ему донести угощение по тропе.',ending:'Ягоды добрались до поляны. Будет чем угостить друзей!',lesson:'bum'},
 {title:'Цветок у тихой воды',icon:2,gift:'Цветок',intro:'У болота растёт сонный цветок. Пройди тихую тропу вместе с Тишкой — и цветок раскроется.',ending:'Цветок проснулся! Он украсит стол на маленьком празднике.',lesson:'bah'},
 {title:'Потерянная ленточка',icon:3,gift:'Ленточка',intro:'Ветер унёс праздничную ленточку на другой берег. Тишка хочет вернуть её Лису. Покажешь дорогу?',ending:'Ленточка нашлась! Лис украсил ею подарок для Тишки.',lesson:'op'},
 {title:'Праздник на поляне',icon:4,gift:'Звёздочка',intro:'Друзья почти готовы к празднику. Осталось найти золотую звёздочку и встретиться на поляне!',ending:'Звёздочка сияет, друзья вместе! Спасибо, что помог Тишке добраться до праздника.',lesson:'trjam'},
 {title:'Первый свет на речке',icon:5,gift:'Лунный луч',intro:'Праздник закончился, но впереди новая речка! Тишка и Лисёнок ищут огоньки для лунного маяка.',ending:'Первый лунный луч найден! Речка уже светится чуть ярче.',lesson:'bum'},
 {title:'Музыка камышей',icon:6,gift:'Ракушка',intro:'Камыши шепчут длинные слова. Помоги Тишке их запомнить и найти речную ракушку.',ending:'Ракушка тихонько поёт. Лисёнок бережно положил её у маяка.',lesson:'op'},
 {title:'Секрет отражений',icon:7,gift:'Серебряная капля',intro:'Вода отражает звёзды, а тропинка поворачивает. Найдём серебряную каплю для маяка?',ending:'Серебряная капля засияла! Ты помог друзьям пройти хитрую тропу.',lesson:'lya'},
 {title:'Огонёк для лодочки',icon:8,gift:'Лодочка',intro:'На берегу ждёт маленькая лодочка. Длинный маршрут приведёт к её волшебному огоньку.',ending:'Огонёк найден, лодочка готова! Остался последний путь к маяку.',lesson:'bah'},
 {title:'Маяк для друзей',icon:9,gift:'Лунная медаль',intro:'Тишка и Лисёнок почти у маяка. Вспомни длинные маршруты — и мы зажжём свет для всех друзей!',ending:'Лунный маяк горит! Ты помог Тишке и Лисёнку пройти обе главы. Вот твоя лунная медаль!',lesson:'trjam'}

];
const DISCOVERIES=[
 {type:'fireflies',icon:'firefly',title:'Огоньки ведут к следующему камню',text:'Проследи за огоньками: они перелетают от Тишки к одному камню и подсвечивают его. Покажи этот камень пальцем, потом продолжим.'},
 {type:'fish',icon:'fish',title:'Рыбки здороваются!',text:'Они выглянули из воды и пустили пузыри. Можно помахать им рукой.'},
 {type:'fox',icon:'fox',title:'Лис заметил нас!',text:'Он машет лапой с другого берега. Помашем ему в ответ?'}
];
export function lessonFor(level){
 const correct=STORIES[level].lesson,keys=Object.keys(COMMANDS);
 const wrong=keys[(keys.indexOf(correct)+2)%keys.length];
 const third=keys.find(k=>k!==correct&&k!==wrong);
 const options=[correct,wrong,third];
 const shift=level%3;
 return {correct,wrong,options:options.slice(shift).concat(options.slice(0,shift)),word:COMMANDS[correct].word,claim:COMMANDS[wrong].label.toLowerCase()};
}
export function interludeFor(level,finishedRound,totalRounds){
 if(finishedRound<=0||finishedRound>=totalRounds)return null;
 if(finishedRound===2)return {kind:'lesson',...lessonFor(level)};
 return {kind:'surprise',...DISCOVERIES[(level+finishedRound-1)%DISCOVERIES.length]};
}
