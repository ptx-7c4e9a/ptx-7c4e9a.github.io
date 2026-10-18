import test from 'node:test';
import assert from 'node:assert/strict';
import fleet from '../src/data/ektp.json' with {type:'json'};
import history from '../src/data/ektp-history.json' with {type:'json'};
import {vehicleAssignments,MOTION_SLOWDOWN,isVehicleMoving,vehicleMotionLabel,vehiclePose} from '../src/ektp/vehicle-motion.mjs';
import {refreshedPosition} from '../src/ektp/position-refresh.mjs';
import {statusTone} from '../src/ui/status-presentation.mjs';
import {demoStatistics} from '../src/ektp/demo-records.mjs';

test('C253 moving speeds span60–130 and share the displayed/motion fixture; C202 geography and slowdown retained',()=>{
 assert.equal(fleet.fleet.length,44);
 const values=new Set();
 for(const v of fleet.fleet){
  assert.ok(isVehicleMoving(v)?v.speed>=60&&v.speed<=130:v.speed===0,v.id);
  if(isVehicleMoving(v))values.add(v.speed);
  const mirrored=history.fleet.find(h=>h.id===v.id);
  if(mirrored)assert.equal(mirrored.speed,v.speed,v.id);
  const assignment=vehicleAssignments.get(v.id);
  const implied=assignment.road.total/(assignment.durationMs/1000/MOTION_SLOWDOWN)*3.6;
  if(isVehicleMoving(v))assert.ok(Math.abs(implied-v.speed)<1e-8,v.id);
  const stats=demoStatistics(v,{from:'2026-10-13T08:00',to:'2026-10-13T12:00'},history.historicalExample);
  assert.ok(stats.maximumSpeedKmh<=130,v.id);
 }
 assert.equal(Math.min(...values),60);assert.equal(Math.max(...values),130);assert.equal(values.size,31);
});

test('C254 movement dominates31/44;13 other states have distinct semantic colors and remain stationary',()=>{
 const moving=fleet.fleet.filter(isVehicleMoving),stopped=fleet.fleet.filter(v=>!isVehicleMoving(v));
 assert.equal(moving.length,31);assert.equal(stopped.length,13);
 const counts={};for(const v of fleet.fleet){const label=vehicleMotionLabel(v);counts[label]=(counts[label]||0)+1;}
 assert.deepEqual(counts,{'В движении':31,'Позиция устарела':1,'Нет связи':2,'Стоит':5,'Зажигание выключено':5});
 assert.equal(new Set(Object.keys(counts).map(statusTone)).size,5);
 for(const v of stopped)assert.deepEqual(vehiclePose(v,0),vehiclePose(v,60000),v.id);
});

test('C256 refresh changes only current state, records Moscow clock and resumes motion at the same road window',()=>{
 const before=fleet.fleet.find(v=>v.id==='v-20'),original=structuredClone(before);
 const response=refreshedPosition(before,new Date('2026-10-18T15:34:56Z'));
 const after={...before,...response.patch};
 assert.deepEqual(before,original);assert.equal(response.time,'18:34:56');
 assert.equal(after.signal,'18.10 · 18:34:56');assert.equal(vehicleMotionLabel(after),'В движении');
 assert.ok(after.speed>=60&&after.speed<=130);assert.equal(after.sensors.ignition,true);
 assert.deepEqual(vehiclePose(before,0).coordinates,vehiclePose(after,0).coordinates);
 assert.notDeepEqual(vehiclePose(after,0).coordinates,vehiclePose(after,60000).coordinates);
 const period={from:'2026-10-13T08:00',to:'2026-10-13T12:00'};
 assert.deepEqual(demoStatistics(after,period,history.historicalExample),demoStatistics(before,period,history.historicalExample));
});


test('C243 a stale position is never presented as live movement; slowdown5 stays intact',async()=>{
 const {vehicleMotionLabel,isVehicleMoving,vehiclePose}=await import('../src/ektp/vehicle-motion.mjs');
 assert.equal(MOTION_SLOWDOWN,5);
 const stale=fleet.fleet.find(v=>String(v.signal).includes('12.10'));
 const fresh=fleet.fleet.find(v=>!String(v.signal).includes('12.10')&&v.speed>0);
 assert.ok(stale);assert.ok(fresh);
 assert.equal(isVehicleMoving(stale),false);assert.equal(vehicleMotionLabel(stale),'Позиция устарела');
 assert.deepEqual(vehiclePose(stale,0),vehiclePose(stale,60000));
 assert.equal(vehicleMotionLabel(fresh),'В движении');assert.notDeepEqual(vehiclePose(fresh,0).coordinates,vehiclePose(fresh,60000).coordinates);
 assert.equal(vehicleMotionLabel({...fresh,speed:0}),'Стоит');
});
