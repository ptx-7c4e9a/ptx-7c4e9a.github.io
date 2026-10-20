import {useEffect,useRef} from 'react';
import {useAnimationFrame,useReducedMotion} from 'motion/react';
import {trailParticle} from './entry-trail.mjs';
import {loadingPoint} from './entry-scene.mjs';

export default function EntryTrail({heads,timelines,circleX=1,circleY=1,loadingFlow=false}:any){
 const ref=useRef<SVGSVGElement>(null),reduced=useReducedMotion();
 // Sample each native leader's playback time; frame deltas may be clamped.
 const draw=()=>{const nodes=ref.current?.children;if(!nodes)return;heads.forEach((head:any,g:number)=>{const seconds=timelines.current.get(head.id)?.time??0;for(let i=0;i<31;i++){const p=trailParticle({...head,group:g},seconds,i),point=loadingFlow?loadingPoint(p.x,p.y):p,node=nodes[g*31+i];node?.setAttribute('cx',String(point.x));node?.setAttribute('cy',String(point.y));node?.setAttribute('opacity',String(p.opacity));}});};
 useEffect(()=>{draw();},[heads]);
 useAnimationFrame(()=>{if(reduced||document.hidden)return;draw();});
 return <svg ref={ref} className="entry-trail" viewBox="0 0 1440 900" aria-hidden="true" data-name="Связанный след ведущих точек">{heads.flatMap((_:any,g:number)=>Array.from({length:31},(_,i)=><ellipse key={`${g}-${i}`} rx={(.8+(i%3)*.15)*circleX} ry={(.8+(i%3)*.15)*circleY} opacity="0"/>))}</svg>;
}
