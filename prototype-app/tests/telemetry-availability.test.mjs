import {test} from 'node:test';
import assert from 'node:assert/strict';
import fleet from '../src/data/ektp.json' with {type:'json'};
import series from '../src/data/telemetry-series.json' with {type:'json'};
import {telemetryFixture,missingArchiveVehicleIds} from '../src/ektp/telemetry-fixture.mjs';

test('C173 all 44 vehicles show channels on the current date, including explicit reapplication and narrow time ranges',()=>{
 for(const vehicle of fleet.fleet)for(const range of [series.period,{from:'2026-10-13T09:01',to:'2026-10-13T09:02'},{from:'2026-10-13T15:00',to:'2026-10-13T16:00'}])for(const chosen of [false,true]){
  const result=telemetryFixture(series.channels,vehicle.id,range,chosen);
  assert.equal(result.available,true,vehicle.id);
  assert.equal(result.channels.length,4,vehicle.id);
  assert.ok(result.channels.every(c=>c.samples.length));
 }
});
test('C173 another date leaves only three explicit archive gaps; returning to current date restores every vehicle',()=>{
 const other={from:'2026-10-14T08:00',to:'2026-10-14T12:00'};
 const missing=fleet.fleet.filter(v=>!telemetryFixture(series.channels,v.id,other,true).available).map(v=>v.id);
 assert.deepEqual(missing.sort(),[...missingArchiveVehicleIds].sort());
 for(const v of fleet.fleet){const r=telemetryFixture(series.channels,v.id,other,true);if(r.available){assert.equal(r.sourceDate,'2026-10-14');assert.equal(r.channels.length,4);}assert.equal(telemetryFixture(series.channels,v.id,series.period,true).available,true);}
});
test('C173 retains source readings for the default period instead of replacing their trace',()=>{
 const result=telemetryFixture(series.channels,'v-44',series.period);
 assert.deepEqual(result.channels,series.channels);
});
