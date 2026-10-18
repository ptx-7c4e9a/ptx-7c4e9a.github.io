export const minute=time=>{const [h,m]=time.split(':').map(Number);return h*60+m;};
export const telemetryDate='2026-10-13';
export const timelineMinute=(value,sourceDate=telemetryDate)=>(Date.parse(value+'+03:00')-Date.parse(sourceDate+'T00:00+03:00'))/60000;
export function readingAt(channel,time){const samples=channel.samples;if(!samples.length)return null;if(channel.discrete)return samples.filter(s=>minute(s.time)<=time).at(-1)||samples[0];return samples.reduce((best,s)=>Math.abs(minute(s.time)-time)<Math.abs(minute(best.time)-time)?s:best,samples[0]);}
export function telemetryRange(channels,range,sourceDate=telemetryDate){const from=Date.parse(range.from+'+03:00'),to=Date.parse(range.to+'+03:00');return channels.map(c=>({...c,samples:c.samples.filter(s=>{const t=Date.parse(sourceDate+'T'+s.time+':00+03:00');return t>=from&&t<=to;})})).filter(c=>c.samples.length);}
