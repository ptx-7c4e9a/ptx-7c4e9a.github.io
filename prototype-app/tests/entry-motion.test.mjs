import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleChannel,trailParticle} from '../src/ui/entry-trail.mjs';
const track={initial:{x:0,y:0},animate:{x:[0,100,200],y:[0,0,0]},transition:{x:{duration:10,times:[0,.5,1],repeat:Infinity},y:{duration:10,times:[0,.5,1],repeat:Infinity}}};
test('trail samples leading-point trajectory across cycles and clamps one-shot loading tracks',()=>{
 assert.equal(sampleChannel(track,'x',2.5),50);assert.equal(sampleChannel(track,'x',12.5),50);assert.equal(sampleChannel(track,'x',-2.5),150);
 const once={...track,transition:{...track.transition,x:{...track.transition.x,repeat:null}}};assert.equal(sampleChannel(once,'x',12.5),200);assert.equal(sampleChannel(once,'x',-2),0);
 assert.equal(trailParticle({track,x:0,y:0,group:0,preRoll:false},0,20).opacity,0);
});
test('particles emit on the leader path and scatter within a bounded radius with continuous visible particles',()=>{
 const head={track,x:100,y:50,group:0};
 for(let seconds=2;seconds<9;seconds+=.025){const lead=100+sampleChannel(track,'x',seconds)+4;let visible=0;
  for(let i=0;i<31;i++){const p=trailParticle(head,seconds,i),age=((seconds+i*2/31)%2+2)%2,birthX=100+sampleChannel(track,'x',seconds-age)+4;assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(Math.hypot(p.x-birthX,p.y-54)<=age*32+.001);assert.ok(Math.hypot(p.x-lead,p.y-54)<=104);if(p.opacity>.1)visible++;}
  assert.ok(visible>=20);
 }
});
test('random direction is stable during one emission and changes on the next birth',()=>{
 const head={track,x:0,y:0,group:0},direction=(time)=>{const p=trailParticle(head,time,0);return Math.atan2(p.y-4,p.x-4-sampleChannel(track,'x',time-time%2));};
 assert.ok(Math.abs(direction(.5)-direction(.51))<1e-10);assert.notEqual(direction(.5),direction(2.5));
});
