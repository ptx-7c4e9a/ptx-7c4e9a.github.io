import test from 'node:test';
import assert from 'node:assert/strict';
import {ALERT_VISIBLE_MS,nextAlertDelay,pickAlertIndex} from '../src/ui/alert-schedule.mjs';

test('background alerts stay within the requested quiet interval; messages last four seconds',()=>{
 assert.equal(ALERT_VISIBLE_MS,4000);
 assert.equal(nextAlertDelay(()=>0),45000);
 assert.equal(nextAlertDelay(()=>1),90000);
 for(let sample=0;sample<=100;sample++)assert.ok(nextAlertDelay(()=>sample/100)>=45000&&nextAlertDelay(()=>sample/100)<=90000);
});
test('background selection never repeats the previous message when alternatives exist',()=>{
 for(let length=2;length<=5;length++)for(let previous=0;previous<length;previous++)for(let sample=0;sample<=100;sample++){
  const index=pickAlertIndex(length,previous,()=>sample/100);
  assert.ok(index>=0&&index<length);assert.notEqual(index,previous);
 }
 assert.equal(pickAlertIndex(1,0),0);
});
