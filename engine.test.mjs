import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,LEVELS,COMMANDS,routeFor,CHAPTERS,chapterFor} from './dist/engine.mjs';
test('каждая тропа проходима и остаётся в пределах поля',()=>{LEVELS.forEach((level,i)=>{const g=new Game(i);level.rounds.forEach(round=>{assert.equal(g.status,'ready');g.start();round.forEach(c=>assert.equal(g.act(c),'correct'))});assert.equal(g.status,'won');assert.equal(g.lives,3);assert.equal(g.completed,g.total);for(const p of routeFor(i)){assert.ok(p.x>=0&&p.x<=5);assert.ok(p.y>=0&&p.y<=6)}assert.deepEqual(g.position,routeFor(i).at(-1));});});
test('ошибка отнимает жизнь, но не меняет позицию и ожидаемую команду',()=>{const g=new Game();g.start();const pos={...g.position};assert.equal(g.act('op'),'wrong');assert.equal(g.lives,2);assert.deepEqual(g.position,pos);assert.equal(g.step,0);assert.equal(g.act('trjam'),'correct');assert.equal(g.step,1)});
test('три ошибки заканчивают попытку, перезапуск возвращает жизни и позицию',()=>{const g=new Game(2);g.start();for(let i=0;i<3;i++)g.act('op');assert.equal(g.status,'lost');assert.equal(g.act('trjam'),'ignored');g.reset(2);assert.equal(g.lives,3);assert.equal(g.status,'ready');assert.deepEqual(g.position,{x:1,y:6})});
test('инструкции используют не более трёх разных слов и трёх повторов',()=>{for(const level of LEVELS)for(const round of level.rounds){assert.ok(new Set(round).size<=3);for(const c of round){assert.ok(COMMANDS[c]);assert.ok(round.filter(k=>k===c).length<=3)}}});
test('команды до старта и между раундами не выполняются',()=>{const g=new Game();assert.equal(g.act('trjam'),'ignored');g.start();g.act('trjam');g.act('trjam');assert.equal(g.status,'ready');assert.equal(g.act('lya'),'ignored')});

test('две главы покрывают десять уровней; переход с 5 на 6 меняет локацию',()=>{
 assert.equal(LEVELS.length,10);assert.equal(CHAPTERS.length,2);assert.equal(chapterFor(4).id,0);assert.equal(chapterFor(5).id,1);assert.equal(chapterFor(9).id,1);
 const ids=CHAPTERS.flatMap(c=>Array.from({length:c.count},(_,i)=>c.start+i));assert.deepEqual(ids,Array.from({length:10},(_,i)=>i));
});
test('новая глава тренирует маршруты из шести-восьми слов без таймера',()=>{
 for(const level of LEVELS.slice(5))for(const round of level.rounds){assert.ok(round.length>=6&&round.length<=8)}
 assert.ok(LEVELS[9].rounds.every(round=>round.length===8));
});
