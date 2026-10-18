import {missingArchiveVehicleIds} from './telemetry-fixture.mjs';
import preparedFleet from '../data/ektp.json' with {type:'json'};
const currentDate='2026-10-13';
export const archiveAvailable=(id,range)=>range.from.slice(0,10)<=currentDate&&range.to.slice(0,10)>=currentDate||!missingArchiveVehicleIds.includes(id);
const seed=id=>[...id].reduce((n,c)=>n+c.charCodeAt(0),0);
export function fuelTransactions(fleet,range){
 const day=range.from.slice(0,10)<=currentDate&&range.to.slice(0,10)>=currentDate?currentDate:range.from.slice(0,10);
 return fleet.filter(v=>archiveAvailable(v.id,range)).flatMap(v=>{
  const n=seed(v.id),first=v.id==='v-44'?12:30+n%81,second=v.id==='v-44'?8:20+n%61;
  return [{id:v.id+'-tx-1',vehicleId:v.id,dateTK:day+'T09:45:00+03:00',dateDUT:day+'T09:49:00+03:00',litresTK:first,litresDUT:first},{id:v.id+'-tx-2',vehicleId:v.id,dateTK:day+'T10:49:00+03:00',dateDUT:day+'T10:53:00+03:00',litresTK:second,litresDUT:second}];
 });
}
export function fuelSummary(rows,fleet){
 return [...new Set(rows.map(r=>r.vehicleId))].map(id=>{const records=rows.filter(r=>r.vehicleId===id),vehicle=fleet.find(v=>v.id===id);return {id,vehicle:vehicle?.plate||'—',vehicleClass:vehicle?.ktsClass||(id==='v-44'?'Топливозаправщик':null),litresTK:records.reduce((s,r)=>s+r.litresTK,0),litresDUT:records.reduce((s,r)=>s+r.litresDUT,0),count:records.length};});
}
export function demoStatistics(vehicle,range,original){
 if(!archiveAvailable(vehicle.id,range))return null;
 if(vehicle.id==='v-44'&&range.from==='2026-10-13T08:00'&&range.to==='2026-10-13T12:00')return original;
 const hours=Math.max(0,(Date.parse(range.to)-Date.parse(range.from))/3600000),n=seed(vehicle.id),moving=Math.min(hours,Math.round(hours*(.45+n%30/100)*10)/10),average=22+n%24;
 const preparedSpeed=preparedFleet.fleet.find(v=>v.id===vehicle.id)?.speed||0;
 return {distanceKm:Math.round(moving*average*10)/10,movingHours:moving,averageSpeedKmh:average,maximumSpeedKmh:Math.min(130,Math.max(average,preparedSpeed)+8)};
}
