import test from 'node:test';
import assert from 'node:assert/strict';
import fleet from '../src/data/ektp.json' with {type:'json'};
import geography from '../src/data/geography.json' with {type:'json'};
import selection from '../source-evidence/long-trips-selected-2026-10-18.json' with {type:'json'};
import arrivals from '../src/data/arrival-targets.json' with {type:'json'};
import {tripRoutes,visibleTrips,loadTripPaths} from '../src/ektp/trip-routes.mjs';
import {vehicleAssignments} from '../src/ektp/vehicle-motion.mjs';
import {historyRoad} from '../src/ektp/history-road.mjs';

const km=(a,b)=>{const p=a[1]*Math.PI/180,q=b[1]*Math.PI/180,dl=(a[0]-b[0])*Math.PI/180;return 6371.0088*2*Math.asin(Math.min(1,Math.sqrt(Math.sin((p-q)/2)**2+Math.cos(p)*Math.cos(q)*Math.sin(dl/2)**2)));};
const length=path=>path.slice(1).reduce((sum,p,i)=>sum+km(path[i],p),0);

test('C203 all44 full trips measure200–2000km on their source road geometry',async()=>{
 const paths=await loadTripPaths();
 assert.equal(tripRoutes.size,44);
 for(const v of fleet.fleet){
  const trip=tripRoutes.get(v.id),source=selection.trips.find(t=>t.vehicleId===v.id);
  assert.ok(trip&&source,v.id);
  const measured=length(source.path);
  assert.ok(measured>=200&&measured<=2000,`${v.id}: ${measured}`);
  assert.ok(Math.abs(measured-trip.distanceKm)<.001,v.id);
  assert.deepEqual(paths.get(v.id).path[0],source.path[0]);assert.deepEqual(paths.get(v.id).path.at(-1),source.path.at(-1));
  assert.ok(trip.motionFromKm>=0&&trip.motionToKm<=trip.distanceKm+.001,v.id);
 }
});
test('C203 full-trip layers respect current fleet/selection; period history remains a shorter separate road segment',()=>{
 const v=fleet.fleet[0],trip=tripRoutes.get(v.id),assignment=vehicleAssignments.get(v.id);
 assert.equal(visibleTrips(fleet.fleet,'').length,44);
 assert.deepEqual(visibleTrips(fleet.fleet,v.id),[trip]);
 assert.deepEqual(visibleTrips(fleet.fleet.filter(f=>f.id!==v.id),v.id),[]);
 const partial=historyRoad(assignment.road,{from:.25,to:.5});
 assert.ok(length(partial)<length(assignment.road.path));assert.ok(length(assignment.road.path)<trip.distanceKm);
 assert.ok(trip.distanceKm>length(partial));
});
test('C204 all prepared arrival estimates use the newly assigned origin and matching target',()=>{
 assert.equal(geography.regionalPlacement.minimumPairDistanceKm,200);
 for(const [targetId,rows] of Object.entries(arrivals.targets)){
  const target=geography.points.find(p=>p.id===targetId);
  for(const row of rows){
   if(row.etaSeconds===null){assert.equal(row.path,null);continue;}
   const origin=vehicleAssignments.get(row.vehicleId).district.center;
   assert.deepEqual(row.originCoordinates,origin);assert.deepEqual(row.targetCoordinates,target.coordinates);
   assert.ok(km(row.routeStart,origin)<.1);assert.ok(km(row.routeEnd,target.coordinates)<.1);
  }
 }
});
test('C204 bounding radii include each entire interpolated edge, not just source vertices',()=>{
 for(const {district:w} of vehicleAssignments.values()){
  for(let i=1;i<w.path.length;i++){
   const a=w.path[i-1],b=w.path[i];
   const edgeBound=111.7*Math.abs(a[1]-b[1])+111.7*Math.cos(Math.min(Math.abs(a[1]),Math.abs(b[1]))*Math.PI/180)*Math.abs(a[0]-b[0]);
   assert.ok(km(w.center,a)+edgeBound<=w.radiusKm+.001,w.id);
  }
 }
});
