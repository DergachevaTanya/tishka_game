import test from 'node:test';
import assert from 'node:assert/strict';
import {COMMANDS,LEVELS} from './dist/engine.mjs';
import {STORIES,lessonFor,interludeFor} from './dist/story.mjs';
test('Тишка действительно ошибается, а правильный ответ есть ровно один',()=>{
 for(let i=0;i<STORIES.length;i++){
  const q=lessonFor(i);assert.notEqual(q.correct,q.wrong);assert.equal(q.claim,COMMANDS[q.wrong].label.toLowerCase());assert.equal(q.options.filter(k=>k===q.correct).length,1);assert.equal(new Set(q.options).size,3);for(const k of q.options)assert.ok(COMMANDS[k]);
 }
});
test('события только между маршрутами: открытие, загадка, затем финал',()=>{
 LEVELS.forEach((level,i)=>{const n=level.rounds.length;assert.equal(interludeFor(i,0,n),null);assert.equal(interludeFor(i,1,n).kind,'surprise');assert.equal(interludeFor(i,2,n).kind,'lesson');assert.equal(interludeFor(i,n,n),null);assert.equal(interludeFor(i,n+1,n),null)});
});
test('у каждой тропы своя цель и награда',()=>{
 assert.equal(STORIES.length,LEVELS.length);assert.equal(new Set(STORIES.map(s=>s.gift)).size,10);for(const s of STORIES){assert.ok(s.intro);assert.ok(s.ending);assert.ok(s.title)}
});
