import test from 'node:test';
import assert from 'node:assert/strict';
import {denseMapVehicles} from '../src/ektp/dense-map-demo.mjs';
import {historyAssignmentFor,vehiclePose,workRouteProgress} from '../src/ektp/vehicle-motion.mjs';
import {demoStatistics} from '../src/ektp/demo-records.mjs';
import {telemetryFixture} from '../src/ektp/telemetry-fixture.mjs';
import series from '../src/data/telemetry-series.json' with {type:'json'};
const range={from:'2026-10-13T08:00',to:'2026-10-13T12:00'};

test('parked demo vehicles stay still in history, with zero distance and no fabricated fuel channel',()=>{
 for(const vehicle of denseMapVehicles.filter(v=>v.demoScenario==='base')){
  assert.equal(historyAssignmentFor(vehicle).road.total,0);
  assert.deepEqual(vehiclePose(vehicle,0,0).coordinates,vehiclePose(vehicle,0,1).coordinates);
  assert.deepEqual(demoStatistics(vehicle,range,{}),{distanceKm:0,movingHours:0,averageSpeedKmh:0,maximumSpeedKmh:0});
  assert.equal(workRouteProgress(vehicle,500),null);
  const channels=telemetryFixture(series.channels,vehicle.id,range).channels;
  assert.equal(channels.some(c=>c.id==='dut-1'),typeof vehicle.fuel==='number');
  assert.ok(channels.find(c=>c.id==='ignition').samples.every(s=>s.value==='Выключено'));
  assert.ok(channels.find(c=>c.id==='rpm').samples.every(s=>parseFloat(s.value)===0));
 }
});
test('convoy history covers four hours at the prepared speed along the road; subperiod statistics scale with time',()=>{
 for(const vehicle of denseMapVehicles.filter(v=>v.demoScenario==='convoy')){
  const road=historyAssignmentFor(vehicle).road;
  assert.ok(Math.abs(road.total-vehicle.speed*4000)<1);
  for(let t=0;t<=1;t+=.1)assert.ok(vehiclePose(vehicle,0,t).coordinates.every(Number.isFinite));
  assert.deepEqual(demoStatistics(vehicle,range,{}),{distanceKm:256,movingHours:4,averageSpeedKmh:64,maximumSpeedKmh:64});
  assert.equal(demoStatistics(vehicle,{from:'2026-10-13T09:00',to:'2026-10-13T10:00'},{}).distanceKm,64);
  for(const seconds of [0,100,10000]){const progress=workRouteProgress(vehicle,seconds);assert.ok(progress>=0&&progress<1);}
  const channels=telemetryFixture(series.channels,vehicle.id,range).channels;
  assert.equal(channels.some(c=>c.id==='dut-1'),typeof vehicle.fuel==='number');
  assert.ok(channels.find(c=>c.id==='ignition').samples.every(s=>s.value==='Включено'));
 }
});
