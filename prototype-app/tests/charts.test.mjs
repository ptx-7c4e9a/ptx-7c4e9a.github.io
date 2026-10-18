import test from 'node:test';
import assert from 'node:assert/strict';
import {roundedSeries,numericAxis,chartTimeTicks,timelineLabel} from '../src/ektp/chart-geometry.mjs';
import {timelineMinute} from '../src/ektp/telemetry.mjs';
test('rounded curves preserve every sample and do not overshoot adjacent values',()=>{for(const points of [[[0,0],[50,100],[100,0],[150,30]],[[0,20],[25,20],[100,20]],[[0,1],[1,5],[30,6],[120,0]]]){const path=roundedSeries(points),segments=[...path.matchAll(/C([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+)/g)].map(m=>m.slice(1).map(Number));assert.equal(segments.length,points.length-1);segments.forEach(([x1,y1,x2,y2,x3,y3],i)=>{const [x0,y0]=points[i];assert.deepEqual([x3,y3],points[i+1]);for(let t=0;t<=1;t+=.02){const y=(1-t)**3*y0+3*(1-t)**2*t*y1+3*(1-t)*t*t*y2+t**3*y3;assert.ok(y>=Math.min(y0,y3)-1e-8&&y<=Math.max(y0,y3)+1e-8);}});}});
test('axis covers all values, constant channels remain finite; four-hour timeline has nine marks',()=>{for(const values of [[46,160,194],[13.5,12.8],[0,0],[-8,-3,5]]){const a=numericAxis(values);assert.ok(a.min<=Math.min(...values));assert.ok(a.max>=Math.max(...values));assert.ok(a.max>a.min);assert.ok(a.ticks.every(Number.isFinite));}assert.deepEqual(chartTimeTicks(480,720),[480,510,540,570,600,630,660,690,720]);});
test('timeline preserves the calendar date across midnight and keeps long periods bounded',()=>{
 const from=timelineMinute('2026-10-12T08:00'),to=timelineMinute('2026-10-13T12:00');
 assert.equal(to-from,28*60);assert.equal(from,-960);assert.equal(to,720);
 assert.equal(timelineLabel(from,'2026-10-13',true),'12.10\n08:00');assert.equal(timelineLabel(to,'2026-10-13',true),'13.10\n12:00');
 for(const span of [60,240,1680,43200,525600]){const ticks=chartTimeTicks(0,span);assert.equal(ticks[0],0);assert.equal(ticks.at(-1),span);assert.ok(ticks.length<=10);assert.ok(ticks.slice(1).every((v,i)=>v>ticks[i]));}
 assert.deepEqual(chartTimeTicks(0,0),[0]);
});

test('time labels keep a readable gap beside both range endpoints',()=>{
 for(const [from,to] of [[480,725],[481,721],[0,245],[-960,720]]){
  const ticks=chartTimeTicks(from,to);assert.equal(ticks[0],from);assert.equal(ticks.at(-1),to);
  assert.ok(ticks.every((t,i)=>!i||t-ticks[i-1]>=(to-from)/8*.5));
 }
});
