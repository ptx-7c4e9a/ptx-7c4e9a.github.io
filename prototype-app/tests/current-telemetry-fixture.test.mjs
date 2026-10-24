import test from 'node:test';
import assert from 'node:assert/strict';
import fleet from '../src/data/ektp.json' with {type:'json'};
import {denseMapVehicles} from '../src/ektp/dense-map-demo.mjs';
import {prepareCurrentTelemetry} from '../src/ektp/current-telemetry-fixture.mjs';
import {mapVehicleReadings} from '../src/ektp/map-telemetry.mjs';

test('prepared current telemetry is complete for about95 percent of online demo records and never fills stale positions',()=>{
 const vehicles=[...fleet.fleet.map(prepareCurrentTelemetry),...denseMapVehicles];
 const online=vehicles.filter(v=>v.connectionState==='online');
 const complete=online.filter(v=>{const r=mapVehicleReadings(v,11);return ['speed','fuel','voltage','rpm'].every(k=>Number.isFinite(r[k]));});
 assert.equal(online.length,161);assert.equal(complete.length,153);
 assert.ok(Math.abs(complete.length/online.length-.95)<.001);
 for(const v of vehicles.filter(v=>v.connectionState!=='online')){
  const r=mapVehicleReadings(v,11);for(const k of ['speed','fuel','voltage','rpm'])assert.equal(r[k],null,v.id+' '+k);
 }
});

test('prepared fixtures preserve operational data and zero readings and do not invent readings for unknown records',()=>{
 const operational=fleet.fleet.find(v=>v.id==='v-44');assert.equal(prepareCurrentTelemetry(operational),operational);
 const idle=denseMapVehicles.find(v=>v.demoScenario==='base'&&v.fuel!==undefined),r=mapVehicleReadings(idle,11);
 assert.equal(r.speed,0);assert.equal(r.rpm,0);assert.equal(r.ignition,false);assert.ok(r.voltage>0&&r.fuel>0);
 const unknown={id:'unprepared',connectionState:'online',speed:10};assert.equal(prepareCurrentTelemetry(unknown),unknown);assert.equal(mapVehicleReadings(unknown).fuel,null);
 assert.equal(prepareCurrentTelemetry(fleet.fleet.find(v=>v.id==='demo-kzn-09')).fuelUnit,'л');
});
