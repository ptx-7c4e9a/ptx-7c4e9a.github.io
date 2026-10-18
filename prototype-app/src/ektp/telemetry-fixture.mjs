import {minute,telemetryDate,telemetryRange,timelineMinute} from './telemetry.mjs';

// Prototype-only availability, not a statement about terminal or server coverage.
// The supplied current-day trace is available to the entire demonstration fleet.
// Three explicit examples have no archive only when the chosen dates exclude it.
export const missingArchiveVehicleIds=['demo-chl-05','demo-kzn-05','demo-ykt-05'];
const clock=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
function boundarySample(channel,time){
 const samples=[...channel.samples].sort((a,b)=>minute(a.time)-minute(b.time)),left=samples.filter(s=>minute(s.time)<=time).at(-1)||samples[0],right=samples.find(s=>minute(s.time)>=time)||samples.at(-1);
 if(channel.discrete||left===right)return {...left,time:clock(time)};
 const a=minute(left.time),b=minute(right.time),v0=parseFloat(left.value.replace(',','.')),v1=parseFloat(right.value.replace(',','.'));
 const unit=left.value.replace(/^[\d.,\s+-]+/,'');
 const value=(v0+(v1-v0)*(time-a)/(b-a)).toLocaleString('ru-RU',{maximumFractionDigits:1});
 return {time:clock(time),value:value+(unit?' '+unit:'')};
}
export function telemetryFixture(channels,vehicleId,range,periodChosen=false){
 const from=Date.parse(range.from+'+03:00'),to=Date.parse(range.to+'+03:00');
 if(!vehicleId||!Number.isFinite(from)||!Number.isFinite(to)||from>=to)return {available:false,sourceDate:telemetryDate,channels:[]};
 const containsCurrentDate=range.from.slice(0,10)<=telemetryDate&&range.to.slice(0,10)>=telemetryDate;
 const sourceDate=containsCurrentDate?telemetryDate:range.from.slice(0,10);
 if(periodChosen&&!containsCurrentDate&&missingArchiveVehicleIds.includes(vehicleId))return {available:false,sourceDate,channels:[]};
 // Other dates and unprovided hours are synthetic prepared examples. Preserve
 // every original 08:00–12:00 anchor; hold endpoint values outside that trace.
 const start=Math.max(0,Math.min(1439,Math.round(timelineMinute(range.from,sourceDate))));
 const end=Math.max(0,Math.min(1439,Math.round(timelineMinute(range.to,sourceDate))));
 const daily=channels.map(c=>{
  const samples=[boundarySample(c,0),...c.samples,boundarySample(c,1439)];
  const augmented={...c,samples};
  for(const t of [start,end])if(!samples.some(s=>s.time===clock(t)))samples.push(boundarySample(augmented,t));
  return {...c,samples:samples.sort((a,b)=>minute(a.time)-minute(b.time))};
 });
 return {available:true,sourceDate,channels:telemetryRange(daily,range,sourceDate)};
}
