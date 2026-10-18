import {test} from 'node:test';
import assert from 'node:assert/strict';
import fleet from '../src/data/ektp.json' with {type:'json'};
import history from '../src/data/ektp-history.json' with {type:'json'};
import {fuelTransactions,fuelSummary,demoStatistics} from '../src/ektp/demo-records.mjs';
import {vehicleDocuments} from '../src/klk/vehicle-documents.mjs';
import {preparedHistoryRange as range} from '../src/ektp/history-availability.mjs';

test('C175 current-day report and statistics cover all 44 vehicles without attributing fleet totals to a single plate',()=>{
 const rows=fuelTransactions(fleet.fleet,range),summary=fuelSummary(rows,fleet.fleet);
 assert.equal(rows.length,88);assert.equal(summary.length,44);
 assert.equal(summary.reduce((s,r)=>s+r.count,0),88);
 for(const v of fleet.fleet){const group=summary.find(r=>r.id===v.id);assert.equal(group.vehicle,v.plate);assert.equal(group.count,2);assert.ok(demoStatistics(v,range,history.historicalExample));}
 assert.deepEqual(demoStatistics(fleet.fleet.find(v=>v.id==='v-44'),range,history.historicalExample),history.historicalExample);
 assert.equal(summary.find(r=>r.id==='v-44').litresTK,20);
 const other={from:'2026-10-14T08:00',to:'2026-10-14T12:00'};
 assert.equal(fuelSummary(fuelTransactions(fleet.fleet,other),fleet.fleet).length,41);
 assert.ok(41/44>=.9);
});
test('C175 document metadata is readable and distinct between vehicles; no fictitious downloadable file links',()=>{
 const a=vehicleDocuments({id:'V-001'}),b=vehicleDocuments({id:'V-002'});
 assert.equal(a.length,3);assert.ok(a.every(d=>d.name&&d.number&&d.issued&&d.valid));
 assert.notEqual(a[0].number,b[0].number);assert.ok(a.every(d=>!d.url&&!d.file));
});
