import series from '../data/telemetry-series.json' with {type:'json'};
import {hasFreshPosition,isVehicleMoving} from './vehicle-motion.mjs';
const minute=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
export function demoChannelValue(channel,time){
 const samples=channel.samples,left=samples.filter(s=>minute(s.time)<=time).at(-1)||samples[0],right=samples.find(s=>minute(s.time)>=time)||samples.at(-1);
 if(channel.discrete)return left.value;
 const a=minute(left.time),b=minute(right.time),value=s=>parseFloat(s.value.replace(',','.'));
 return value(left)+(value(right)-value(left))*(b===a?0:Math.max(0,Math.min(1,(time-a)/(b-a))));
}
// A single prepared trace, explicitly replayed at x60. This is never a live
// terminal feed, a consumption calculation, or a conversion of CAN percent to litres.
export function mapVehicleReadings(vehicle,seconds=0){
 const fresh=hasFreshPosition(vehicle),moving=isVehicleMoving(vehicle);
 const state=!fresh?(vehicle.connectionState==='offline'?'offline':'stale'):moving?'moving':'idle';
 const minuteInTrace=480+((Math.max(0,seconds)%240));
 const clock=String(Math.floor(minuteInTrace/60)).padStart(2,'0')+':'+String(Math.floor(minuteInTrace%60)).padStart(2,'0');
 const value=id=>demoChannelValue(series.channels.find(c=>c.id===id),minuteInTrace);
 return {state,fresh,moving,clock,elapsedSeconds:seconds,replay:fresh&&moving,
  speed:fresh?vehicle.speed:null,
  fuelLabel:moving?'Топливо · ДУТ':'Топливо в баке',fuelUnit:moving?'л':vehicle.fuelUnit||'%',
  fuel:fresh&&typeof vehicle.fuel==='number'?(moving?value('dut-1'):vehicle.fuel):null,
  voltage:fresh&&typeof vehicle.sensors?.battery==='number'?(moving&&!vehicle.demoScenario?value('voltage'):vehicle.sensors.battery):null,
  rpm:fresh&&typeof vehicle.sensors?.rpm==='number'?vehicle.sensors.rpm:null,
  ignition:fresh&&typeof vehicle.sensors?.ignition==='boolean'?vehicle.sensors.ignition:null,
  label:{moving:'В движении · на связи',idle:'Стоит · на связи',offline:'Нет связи',stale:'Позиция устарела'}[state],
 };
}
