import test from 'node:test';
import assert from 'node:assert/strict';
import {moveDirection,jumpFrame,POND_FISH,fishState,fishOrientation} from './dist/motion.mjs';
test('направление прыжка определяется по реальному перемещению',()=>{
 assert.equal(moveDirection({x:0,y:0},{x:-102,y:0}),'left');assert.equal(moveDirection({x:0,y:0},{x:102,y:0}),'right');assert.equal(moveDirection({x:0,y:100},{x:0,y:46}),'up');
});
test('прыжок начинается и заканчивается на платформе; длинный прыжок выше',()=>{
 for(const d of ['left','right','up']){assert.ok(Math.abs(jumpFrame(d,0).lift)<1e-8);assert.ok(Math.abs(jumpFrame(d,1).lift)<1e-8);assert.ok(jumpFrame(d,.5).lift>30);assert.ok(jumpFrame(d,.5,true).lift>jumpFrame(d,.5).lift)}
 assert.equal(jumpFrame('left',.5).flip,-1);assert.equal(jumpFrame('right',.5).flip,1);assert.equal(jumpFrame('up',.5).col,0);
});
test('уменьшение движения убирает высоту, наклон и растяжение прыжка',()=>{
 const f=jumpFrame('left',.5,true,true);assert.equal(f.lift,0);assert.equal(f.lean,0);assert.equal(f.stretch,1);
});
test('восемь рыбок плавают по ограниченным маршрутам и используют четыре вида',()=>{
 assert.equal(POND_FISH.length,8);assert.equal(new Set(POND_FISH.map(f=>f.style)).size,4);
 for(const f of POND_FISH){for(let t=0;t<=600;t+=3){const p=fishState(f,t);assert.ok(Number.isFinite(p.heading));assert.ok(p.x>100&&p.x<760);assert.ok(p.y>120&&p.y<550)}assert.notDeepEqual(fishState(f,0),fishState(f,10));}
});

test('рыбки всегда горизонтальны и разворачиваются только влево или вправо',()=>{
 for(const heading of [-3,-2,-1,0,1,2,3]){const {flip,tilt}=fishOrientation(heading);assert.equal(tilt,0);assert.equal(flip,Math.cos(heading)<0?-1:1)}
 for(const d of ['left','right']){assert.equal(jumpFrame(d,.95).col,0);assert.equal(jumpFrame(d,.95).row,1)}
});
