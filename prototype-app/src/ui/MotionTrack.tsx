import {Children,createContext,isValidElement,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {motion,useAnimate,useAnimationFrame,useReducedMotion} from 'motion/react';
import EntryTrail from './EntryTrail';
import {fadeCenters} from './entry-scene.mjs';
const LinkedTrailContext=createContext<any>(null);

// Track values and transitions are generated verbatim from Figma motion snippets.
export function Track({track,children,...rest}:any){
 const [scope,animate]=useAnimate();const reduced=useReducedMotion(),linkedTrail=useContext(LinkedTrailContext);
 const particle=/\/ частица \d+$/.test(rest['data-name']||'');
 const timelineId=rest['data-name']?.endsWith('/ импульс')?(rest['data-node-id']||rest['data-name']):null;
 // User revision O32. Figma owner sync remains open in the intake package.
 // Exported particle SVGs bake opacity=0 and a 32px canvas around a 2px circle.
 // Draw the simple native ellipse at its own box; retain every source x/y/time keyframe.
 const visibleTrack=useMemo(()=>particle?{...track,animate:{...track.animate,opacity:track.animate.opacity?.map((v:number)=>Math.min(.95,v*3))}}:track,[track,particle]);
 const shade=['#595752','#76736e','#8b8882','#a29f99'][Number((rest['data-name']||'').match(/\d+$/)?.[0]||0)%4];
 useEffect(()=>{
  if(reduced||(particle&&linkedTrail?.enabled)||!scope.current)return;
  const controls=animate(scope.current,visibleTrack.animate,visibleTrack.transition);
  const timelines=linkedTrail?.timelines.current;
  if(timelineId)timelines?.set(timelineId,controls);
  const visibility=()=>document.hidden?controls.pause():controls.play();
  document.addEventListener('visibilitychange',visibility);visibility();
  return()=>{if(timelineId&&timelines?.get(timelineId)===controls)timelines.delete(timelineId);controls.stop();document.removeEventListener('visibilitychange',visibility);};
 },[reduced,visibleTrack,animate,particle,linkedTrail,timelineId]);
 if(particle&&linkedTrail?.enabled)return null;
 return <motion.div ref={scope} initial={visibleTrack.initial} style={{...visibleTrack.style,...(particle?{'--particle-shade':shade}: {})}} {...rest} data-particle={particle?'true':undefined}>{children}</motion.div>;
}
export function MotionViewport({children,initialTrail=true,loadingFlow=false}:any){const ref=useRef<HTMLDivElement>(null);const [size,setSize]=useState([1440,900]);
 const timelines=useRef(new Map<string,{readonly time:number}>());
 const elapsed=useRef(0),resumeFrame=useRef(false),reduced=useReducedMotion();
 const drawFades=(seconds:number)=>{const centers=fadeCenters(seconds);Object.entries(centers).forEach(([key,value])=>ref.current?.style.setProperty(`--fade-${key}`,`${value}%`));};
 useEffect(()=>{drawFades(0);const visibility=()=>{resumeFrame.current=true;};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[]);
 useAnimationFrame((_t,delta)=>{if(reduced||document.hidden)return;if(resumeFrame.current)resumeFrame.current=false;else elapsed.current+=delta/1000;drawFades(elapsed.current);});
 const heads=useMemo(()=>{const found:any[]=[];const visit=(nodes:any)=>Children.forEach(nodes,node=>{if(!isValidElement(node))return;const p=node.props as any;if(p.track&&p['data-name']?.endsWith('/ импульс')){const x=Number(p.className?.match(/left-\[(-?[\d.]+)px\]/)?.[1]),y=Number(p.className?.match(/top-\[(-?[\d.]+)px\]/)?.[1]);if(Number.isFinite(x)&&Number.isFinite(y))found.push({id:p['data-node-id']||p['data-name'],track:p.track,x,y,preRoll:initialTrail});}if(p.children)visit(p.children);});visit(children);return found;},[children,initialTrail]);
 const linkedTrail=useMemo(()=>({enabled:heads.length>0,timelines}),[heads.length]);
 useEffect(()=>{const o=new ResizeObserver(([e])=>setSize([e.contentRect.width,e.contentRect.height]));if(ref.current)o.observe(ref.current);return()=>o.disconnect();},[]);const sx=size[0]/1440,sy=size[1]/900,uniform=Math.min(sx,sy);return <LinkedTrailContext.Provider value={linkedTrail}><div ref={ref} className="motion-viewport" aria-hidden="true"><div className="motion-stage" style={{transform:`scale(${sx},${sy})`,'--circle-x':uniform/sx,'--circle-y':uniform/sy} as any}>{children}{heads.length>0&&<EntryTrail heads={heads} timelines={timelines} loadingFlow={loadingFlow} circleX={uniform/sx} circleY={uniform/sy}/>}</div></div></LinkedTrailContext.Provider>;}
