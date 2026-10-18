import {useEffect,useRef} from 'react';
import {useAnimationFrame,useReducedMotion} from 'motion/react';
import {trailParticle} from './entry-trail.mjs';
import {loadingPoint} from './entry-scene.mjs';

export default function EntryTrail({heads,circleX=1,circleY=1,loadingFlow=false}:any){
 const ref=useRef<SVGSVGElement>(null),elapsed=useRef(0),resumeFrame=useRef(false),reduced=useReducedMotion();
 const draw=(seconds:number)=>{const nodes=ref.current?.children;if(!nodes)return;heads.forEach((head:any,g:number)=>{for(let i=0;i<31;i++){const p=trailParticle({...head,group:g},seconds,i),point=loadingFlow?loadingPoint(p.x,p.y):p,node=nodes[g*31+i];node?.setAttribute('cx',String(point.x));node?.setAttribute('cy',String(point.y));node?.setAttribute('opacity',String(p.opacity));}});};
 useEffect(()=>{elapsed.current=0;draw(0);const visibility=()=>{resumeFrame.current=true;};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[heads]);
 useAnimationFrame((_t,delta)=>{if(reduced||document.hidden)return;if(resumeFrame.current)resumeFrame.current=false;else elapsed.current+=delta/1000;draw(elapsed.current);});
 return <svg ref={ref} className="entry-trail" viewBox="0 0 1440 900" aria-hidden="true" data-name="Связанный след ведущих точек">{heads.flatMap((_:any,g:number)=>Array.from({length:31},(_,i)=><ellipse key={`${g}-${i}`} rx={(.8+(i%3)*.15)*circleX} ry={(.8+(i%3)*.15)*circleY} opacity="0"/>))}</svg>;
}
