import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {preparedArrivals} from '../src/ektp/prepared-arrivals.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../src/data/arrival-targets.json',import.meta.url)));
const zones=JSON.parse(fs.readFileSync(new URL('../src/data/zones.json',import.meta.url)));
const ids=zones.candidates.map(c=>c.vehicleId);

test('every visible destination has its own prepared road estimates; stale position never receives ETA',()=>{
 for(const point of zones.points){
  const rows=preparedArrivals(data.targets,point.id,ids,ids);
  assert.equal(rows.length,4);assert.equal(rows.filter(r=>Number.isFinite(r.etaSeconds)&&r.distanceM>0).length,3);
  assert.equal(rows.at(-1).vehicleId,'v-20');assert.equal(rows.at(-1).etaSeconds,null);assert.equal(rows.at(-1).positionAt,'2026-10-12T15:47:00+03:00');
  for(const row of rows.filter(r=>r.routeEnd)){assert.ok(Math.abs(row.routeEnd[0]-point.coordinates[0])<.001);assert.ok(Math.abs(row.routeEnd[1]-point.coordinates[1])<.001);}
 }
 assert.notEqual(data.targets['point-base'][0].etaSeconds,data.targets['point-east'][0].etaSeconds);
 assert.notEqual(data.targets['point-service'][0].etaSeconds,data.targets['point-base'][0].etaSeconds);
 assert.equal(preparedArrivals(data.targets,'point-service',ids,ids)[0].vehicleId,'v-44');
 assert.equal(preparedArrivals(data.targets,'point-base',ids,ids)[0].vehicleId,'v-26');
});
test('prepared comparison respects both selection and organization without mutating fixtures or substituting an unknown target',()=>{
 const before=JSON.stringify(data);assert.deepEqual(preparedArrivals(data.targets,'point-base',['v-44','v-11'],['v-11']).map(r=>r.vehicleId),['v-11']);
 assert.deepEqual(preparedArrivals(data.targets,'missing',ids,ids),[]);assert.deepEqual(preparedArrivals(data.targets,'point-base',[],ids),[]);
 assert.equal(JSON.stringify(data),before);
});
