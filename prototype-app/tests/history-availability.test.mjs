import {test} from 'node:test';
import assert from 'node:assert/strict';
import {historyAvailability,preparedHistoryRange} from '../src/ektp/history-availability.mjs';
test('default history and illustrative statistics are available throughout the demo fleet under C175',()=>{
 for(let i=1;i<=44;i++){const state=historyAvailability(`v-${i}`,preparedHistoryRange,false);assert.equal(state.movement,true);assert.equal(state.statistics,true);}
});
test('after an explicit period choice the prepared coverage is checked',()=>{
 assert.equal(historyAvailability('v-44',{from:'2026-10-13T09:00',to:'2026-10-13T10:00'},true).movement,true);
 assert.equal(historyAvailability('v-44',{from:'2026-10-14T08:00',to:'2026-10-14T12:00'},true).movement,true);
 assert.equal(historyAvailability('v-20',preparedHistoryRange,true).movement,true);
 assert.equal(historyAvailability('demo-chl-05',{from:'2026-10-14T08:00',to:'2026-10-14T12:00'},true).movement,false);
});
test('explicit subperiod intersects the prepared coverage without stretching it to a full route',()=>{
 assert.deepEqual(historyAvailability('v-44',{from:'2026-10-13T09:00',to:'2026-10-13T10:00'},true).window,{from:.25,to:.5});
 assert.deepEqual(historyAvailability('v-44',{from:'2026-10-13T06:00',to:'2026-10-13T09:00'},true).window,{from:0,to:.25});
 assert.deepEqual(historyAvailability('v-44',{from:'2026-10-13T11:00',to:'2026-10-14T09:00'},true).window,{from:.75,to:1});
 for(const range of [{from:'2026-10-13T12:00',to:'2026-10-13T13:00'},{from:'invalid',to:'2026-10-13T12:00'},{from:'2026-10-13T10:00',to:'2026-10-13T09:00'}])assert.equal(historyAvailability('v-44',range,true).window,null);
});
