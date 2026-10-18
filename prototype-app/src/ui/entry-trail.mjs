// C117: sample the unchanged leading-point keyframes for a synchronized trail.
export function sampleChannel(track,key,seconds){
 const values=track.animate?.[key];if(!Array.isArray(values))return values??track.initial?.[key]??0;
 const transition=track.transition?.[key]??{},duration=transition.duration??1;
 const t=transition.repeat===Infinity?((seconds%duration)+duration)%duration:Math.max(0,Math.min(duration,seconds));
 const times=transition.times??values.map((_,i)=>i/(values.length-1)),p=t/duration;
 let lo=0,hi=Math.min(times.length,values.length)-1;
 if(p<=times[0])return values[0];if(p>=times[hi])return values[hi];
 while(hi-lo>1){const mid=(lo+hi)>>1;if(times[mid]<=p)lo=mid;else hi=mid;}
 const fraction=(p-times[lo])/(times[hi]-times[lo]);return values[lo]+(values[hi]-values[lo])*fraction;
}
export function trailParticle(head,seconds,index,count=31){
 const life=2,age=((seconds+index*life/count)%life+life)%life,progress=age/life;
 const at=seconds-age,x=sampleChannel(head.track,'x',at),y=sampleChannel(head.track,'y',at);
 // Seed per emission, not per frame: each birth scatters differently without jitter.
 const generation=Math.floor((seconds+index*life/count)/life),seed=((index+1)*73856093)^((head.group+1)*19349663)^(generation*83492791);
 const random=(value)=>{let n=(value+0x6D2B79F5)|0;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};
 const angle=random(seed)*Math.PI*2,distance=age*(18+random(seed+17)*14);
 return {x:head.x+x+4+Math.cos(angle)*distance,y:head.y+y+4+Math.sin(angle)*distance,
  opacity:at<0&&(head.preRoll===false||head.track.transition?.x?.repeat!==Infinity)?0:Math.min(1,age/.12)*Math.pow(1-progress,1.3)*.65,radius:.8+(index%3)*.15};
}
