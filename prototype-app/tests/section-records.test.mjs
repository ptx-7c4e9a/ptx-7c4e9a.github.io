import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../src/data/ektp-sections.json' with {type:'json'};
import fleet from '../src/data/ektp.json' with {type:'json'};
import {matchingRecords} from '../src/ektp/section-records.mjs';
test('document fixture preserves unique records and task/vehicle relations',()=>{
 for(const key of ['requests','tasks','waybills','contractors','departments'])assert.equal(new Set(fixture[key].map(r=>r.id)).size,fixture[key].length);
 for(const r of fixture.requests)for(const id of r.taskIds)assert.equal(fixture.tasks.find(t=>t.id===id)?.requestId,r.id);
 for(const item of [...fixture.tasks,...fixture.waybills])if(item.vehicleId)assert.ok(fleet.fleet.some(v=>v.id===item.vehicleId));
 assert.ok(fixture.waybills.every(w=>w.requestId===null));
});
test('request search intersects status and creation date without using work dates',()=>{
 const rows=[{id:'a',number:'ЗТ-42',description:'Топливо',status:'В работе',created:'2026-10-12',startAt:'2026-10-13T08:00:00+03:00'},{id:'b',number:'ЗТ-43',description:'ТОПЛИВО',status:'Черновик',created:'2026-10-13'}];
 assert.deepEqual(matchingRecords(rows,{query:' топливо ',fields:['number','description'],category:'В работе',categoryKey:'status',dates:{from:'2026-10-12',to:'2026-10-12'}}).map(r=>r.id),['a']);
 assert.equal(matchingRecords(rows,{query:'топливо',fields:['description'],category:'В работе',categoryKey:'status',dates:{from:'2026-10-13',to:'2026-10-13'}}).length,0);
});
test('waybill date filtering includes spanning intervals and Moscow day boundaries',()=>{
 const rows=[{id:'span',startAt:'2026-10-12T20:00:00+03:00',endAt:'2026-10-14T01:00:00+03:00'},{id:'before',startAt:'2026-10-12T08:00:00+03:00',endAt:'2026-10-12T23:59:59+03:00'},{id:'end',startAt:'2026-10-13T23:59:59+03:00',endAt:'2026-10-14T01:00:00+03:00'}];
 assert.deepEqual(matchingRecords(rows,{dates:{from:'2026-10-13',to:'2026-10-13'},dateMode:'interval'}).map(r=>r.id),['span','end']);
 assert.equal(matchingRecords([{inn:null,name:'Компания'}],{query:'0',fields:['inn','name']}).length,0);
});
