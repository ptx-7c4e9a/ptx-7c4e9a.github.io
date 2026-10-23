import {parkingRoadClearance} from '../src/ektp/dense-map-parking.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mapPreviewPlacement,fleetOwnership,mapVehicleGroups} from '../src/ektp/map-vehicle-state.mjs';
import {denseMapVehicles,denseConvoyRoad} from '../src/ektp/dense-map-demo.mjs';
import {vehiclePose,MOTION_SLOWDOWN} from '../src/ektp/vehicle-motion.mjs';
test('map preview stays within the viewport at each edge and centres vertically beside the marker',()=>{
 const bounds={left:0,top:0,right:1280,bottom:720},size={width:336,height:600};
 for(const anchor of [{x:0,y:0},{x:1279,y:0},{x:0,y:719},{x:1279,y:719},{x:640,y:360}]){
  const p=mapPreviewPlacement(anchor,bounds,size);assert.ok(p.left>=12&&p.top>=12);assert.ok(p.left+336<=1268&&p.top+600<=708);
 }
 assert.deepEqual(mapPreviewPlacement({x:1000,y:690},bounds,size),{left:640,top:108});
 assert.deepEqual(mapPreviewPlacement({x:1000,y:600},{left:0,top:0,right:1280,bottom:1200},{width:280,height:420}),{left:696,top:390});
 assert.equal(fleetOwnership({kind:'Собственное'}),'owned');assert.equal(fleetOwnership({kind:'Наёмное'}),'hired');assert.equal(fleetOwnership({}),'unknown');
});
test('illustrative base has100 stationary vehicles and convoy has20, with unique IDs and a closed surveyed-road route',()=>{
 assert.equal(denseMapVehicles.filter(v=>v.demoScenario==='base').length,100);
 assert.equal(denseMapVehicles.filter(v=>v.demoScenario==='convoy').length,20);
 assert.equal(new Set(denseMapVehicles.map(v=>v.id)).size,120);
 assert.equal(new Set(denseMapVehicles.map(v=>v.vehicleType)).size,5);
 for(const type of new Set(denseMapVehicles.map(v=>v.vehicleType))){assert.equal(denseMapVehicles.filter(v=>v.vehicleType===type&&v.demoScenario==='base').length,20);assert.equal(denseMapVehicles.filter(v=>v.vehicleType===type&&v.demoScenario==='convoy').length,4);}
 assert.deepEqual(denseConvoyRoad[0],denseConvoyRoad.at(-1));assert.ok(denseConvoyRoad.length>50);
 const parked=denseMapVehicles[0];assert.deepEqual(vehiclePose(parked,0),vehiclePose(parked,100000));
 const moving=denseMapVehicles.find(v=>v.demoScenario==='convoy');
 const a=vehiclePose(moving,0).coordinates,b=vehiclePose(moving,1000).coordinates;
 const metres=Math.hypot((b[0]-a[0])*Math.cos(a[1]*Math.PI/180),b[1]-a[1])*111320;
 assert.ok(Math.abs(metres-moving.speed/3.6/MOTION_SLOWDOWN)<.2);
});

test('current map telemetry distinguishes unavailable channels and replays supplied litres without converting CAN percent',async()=>{
 const {mapVehicleReadings,demoChannelValue}=await import('../src/ektp/map-telemetry.mjs');
 const moving={connectionState:'online',speed:64,fuel:50,sensors:{battery:27.5,rpm:1450,ignition:true}};
 const first=mapVehicleReadings(moving,0),later=mapVehicleReadings(moving,11);
 assert.equal(first.fuel,160);assert.equal(later.fuel,157.9);assert.equal(first.voltage,13.8);
 assert.equal(first.speed,later.speed);assert.equal(first.state,'moving');assert.equal(first.replay,true);
 const idle=mapVehicleReadings({...moving,speed:0,sensors:{battery:24.6,rpm:0,ignition:false}},11);
 assert.equal(idle.state,'idle');assert.equal(idle.fuel,50);assert.equal(idle.voltage,24.6);assert.equal(idle.replay,false);assert.equal(idle.fuelUnit,'%');assert.equal(first.fuelUnit,'л');
 assert.equal(mapVehicleReadings({...moving,speed:0,fuelUnit:'л'},11).fuelUnit,'л');
 for(const connectionState of ['offline','stale']){const r=mapVehicleReadings({...moving,connectionState},11);assert.equal(r.fuel,null);assert.equal(r.speed,null);assert.equal(r.replay,false);assert.equal(r.state,connectionState);}
 assert.equal(mapVehicleReadings({connectionState:'online',speed:50},11).fuel,null);
 assert.equal(demoChannelValue({samples:[{time:'08:00',value:'10 л'},{time:'08:10',value:'8 л'}]},485),9);
 assert.equal(demoChannelValue({discrete:true,samples:[{time:'08:00',value:'Включено'},{time:'08:10',value:'Выключено'}]},485),'Включено');
});

test('ten parking blocks separate type and ownership; maximum zoom never clusters vehicles',()=>{
 const parked=denseMapVehicles.filter(v=>v.demoScenario==='base'),groups=new Map();
 for(const v of parked){if(!groups.has(v.demoGroup))groups.set(v.demoGroup,[]);groups.get(v.demoGroup).push(v);}
 assert.equal(groups.size,10);assert.equal(parked.filter(v=>v.kind==='Собственное').length,50);
 for(const g of groups.values()){assert.equal(g.length,10);assert.equal(new Set(g.map(v=>v.kind)).size,1);assert.equal(new Set(g.map(v=>v.vehicleType)).size,1);assert.ok(new Set(g.map(v=>Math.round(v.demoHeading))).size>2);}
 const points=parked.map((v,i)=>({id:v.id,v,x:i%10,y:Math.floor(i/10)}));
 const mid=mapVehicleGroups(points,16);assert.equal(mid.length,10);assert.ok(mid.every(g=>g.members.length===10));
 const close=mapVehicleGroups(points,18);assert.equal(close.length,100);assert.ok(close.every(g=>g.members.length===1));
 assert.equal(mapVehicleGroups(points,16,points[0].id).find(g=>g.key===points[0].id).members.length,1);
});

test('parked vehicles leave the access track and neighbouring vehicles clear',()=>{
 const parked=denseMapVehicles.filter(v=>v.demoScenario==='base');
 for(const v of parked){assert.equal(v.speed,0);assert.ok(parkingRoadClearance(v.demoCoordinates)>22,v.id+' obstructs the track');assert.equal(vehiclePose(v,0).heading,v.demoHeading);}
 let nearest=Infinity;
 for(let i=0;i<parked.length;i++)for(let j=i+1;j<parked.length;j++){
  const a=parked[i].demoCoordinates,b=parked[j].demoCoordinates;
  nearest=Math.min(nearest,Math.hypot((b[0]-a[0])*Math.cos(a[1]*Math.PI/180),b[1]-a[1])*111320);
 }
 assert.ok(nearest>16,'parking markers/vehicles overlap: '+nearest);
});
