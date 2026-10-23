import {denseConvoyRoad} from './dense-map-demo.mjs';
import geography from '../data/geography.json' with {type:'json'};
import fleet from '../data/ektp.json' with {type:'json'};
export const MOTION_SLOWDOWN=5;
export const LOOP_DURATION_MS=160000*MOTION_SLOWDOWN;
export function compileRoad(path){let total=0;const cumulative=[0];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];total+=Math.hypot((b[0]-a[0])*Math.cos((a[1]+b[1])*Math.PI/360),b[1]-a[1])*111320;cumulative.push(total);}return{path,cumulative,total};}
export function poseAlong(road,t){const {path,cumulative,total}=road;if(path.length<2)return{coordinates:path[0],heading:0};const target=Math.max(0,Math.min(1,t))*total;let low=1,high=path.length-1;while(low<high){const mid=(low+high)>>1;if(cumulative[mid]<target)low=mid+1;else high=mid;}const i=low,a=path[i-1],b=path[i],ratio=(target-cumulative[i-1])/(cumulative[i]-cumulative[i-1]||1),dx=(b[0]-a[0])*Math.cos((a[1]+b[1])*Math.PI/360),dy=b[1]-a[1];return{coordinates:[a[0]+(b[0]-a[0])*ratio,a[1]+(b[1]-a[1])*ratio],heading:Math.atan2(dx,dy)*180/Math.PI};}
const compiled=new Map();for(const route of Object.values(geography.routes))for(const district of route.districts||[])compiled.set(district.id,compileRoad(district.path));
export const vehicleAssignments=new Map();for(const city of Object.keys(geography.routes)){const vehicles=fleet.fleet.filter(v=>v.city===city);const districts=geography.routes[city].districts;vehicles.forEach((v,i)=>{const district=districts.find(d=>d.id===geography.vehicleDistricts[v.id]);const road=compiled.get(district.id);vehicleAssignments.set(v.id,{district,road,durationMs:road.total/(Math.max(1,v.speed)/3.6)*1000*MOTION_SLOWDOWN,phase:.25});});}
export function hasFreshPosition(v){if(v.connectionState)return v.connectionState==='online';return !!v.signal&&!/\d{2}\.\d{2}/.test(String(v.signal));}
export function isVehicleMoving(v){return v.speed>0&&hasFreshPosition(v);}
export function vehicleMotionLabel(v){return v.connectionState==='offline'?'Нет связи':!hasFreshPosition(v)?'Позиция устарела':isVehicleMoving(v)?'В движении':v.sensors?.ignition===false?'Зажигание выключено':'Стоит';}
const demoRoad=compileRoad(denseConvoyRoad);
const demoHistory=new Map();
export function historyAssignmentFor(v){
 const assigned=vehicleAssignments.get(v?.id);if(assigned)return assigned;
 if(!v?.demoScenario)return null;
 if(!demoHistory.has(v.id)){
  if(v.demoScenario==='base')demoHistory.set(v.id,{road:compileRoad([v.demoCoordinates,v.demoCoordinates])});
  else{
   const path=[],distance=v.speed/3.6*14400;let cursor=((v.demoOffsetMetres%demoRoad.total)+demoRoad.total)%demoRoad.total,done=0;
   path.push(poseAlong(demoRoad,cursor/demoRoad.total).coordinates);
   while(done<distance-.001){
    const next=demoRoad.cumulative.find(d=>d>cursor+.001)??demoRoad.total,step=Math.min(next-cursor,distance-done);
    if(step<=.001){cursor=0;continue;}
    done+=step;cursor+=step;path.push(poseAlong(demoRoad,cursor/demoRoad.total).coordinates);
    if(cursor>=demoRoad.total-.001)cursor=0;
   }
   demoHistory.set(v.id,{road:compileRoad(path)});
  }
 }
 return demoHistory.get(v.id);
}
export function workRouteProgress(v,seconds=0){
 if(!hasFreshPosition(v)||v.demoScenario==='base')return null;
 if(v.demoScenario==='convoy')return ((v.demoOffsetMetres+seconds*(v.speed/3.6)/MOTION_SLOWDOWN)%demoRoad.total)/demoRoad.total;
 const a=vehicleAssignments.get(v.id);return a?isVehicleMoving(v)?(a.phase+seconds*1000/a.durationMs)%1:a.phase:null;
}
export function vehiclePose(v,time=0,history=null){if(v.demoScenario==='base')return{coordinates:v.demoCoordinates,heading:v.demoHeading??0};if(v.demoScenario==='convoy'&&history!==null)return poseAlong(historyAssignmentFor(v).road,history);if(v.demoScenario==='convoy')return poseAlong(demoRoad,((v.demoOffsetMetres+time/1000*(v.speed/3.6)/MOTION_SLOWDOWN)%demoRoad.total)/demoRoad.total);const assignment=vehicleAssignments.get(v.id);if(!assignment)return{coordinates:geography.routes[v.city]?.center||[37.6,55.75],heading:0};const moving=isVehicleMoving(v);const durationMs=assignment.road.total/(Math.max(1,v.speed)/3.6)*1000*MOTION_SLOWDOWN;const progress=history!==null?history:moving?(assignment.phase+time/durationMs)%1:assignment.phase;return poseAlong(assignment.road,progress);}
