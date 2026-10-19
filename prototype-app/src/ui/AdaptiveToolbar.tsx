import Smooth from './Smooth';
import {useLayoutEffect,useRef,useState} from 'react';
import {Button,IconButton} from './index';
import {fitToolbar} from '../logic.mjs';

// Measure the real DS controls; move secondary actions to the same shared menu.
// Source measurements are invisible/inert and never alter working context.
export default function AdaptiveToolbar({primary,context=null,contextMinWidth=160,actions,onOverflow}:any){
 const contextSlot=useRef<HTMLDivElement>(null);const row=useRef<HTMLDivElement>(null),leading=useRef<HTMLDivElement>(null),measure=useRef<HTMLDivElement>(null),menu=useRef<HTMLDivElement>(null);
 const [hidden,setHidden]=useState<string[]>([]);
 const action=(a:any,measuring=false)=><Smooth.div key={a.id} className={`toolbar-action ${a.onReset?'toolbar-action-resettable':''}`}><>{a.iconOnly?<IconButton className={`icon-button ${a.className||''} ${a.pressed?'active':''}`} type="button" name={a.icon} label={a.label} active={a.pressed} data-tooltip={measuring?undefined:a.tooltip} aria-haspopup={a.menu?"menu":undefined} aria-expanded={a.menu?!!a.pressed:undefined} tabIndex={measuring?-1:undefined} onClick={measuring?undefined:a.onClick}/>:<Button data-period-trigger={a.id==='period'&&!measuring?'true':undefined} icon={a.icon} tone={a.tone} data-tooltip={measuring?undefined:a.tooltip} aria-pressed={a.pressed} tabIndex={measuring?-1:undefined} onClick={measuring?undefined:a.onClick}>{a.label}</Button>}</>{a.onReset&&<IconButton name="close" label="Сбросить период" tabIndex={measuring?-1:undefined} onClick={measuring?undefined:(e:any)=>{(e.currentTarget.previousElementSibling as HTMLElement)?.focus();a.onReset();}}/>}</Smooth.div>;
 useLayoutEffect(()=>{
  const update=()=>{
   if(!row.current||!leading.current||!measure.current||!menu.current)return;
   const widths=Array.from(measure.current.children).map((e:any)=>e.getBoundingClientRect().width);
   const available=row.current.clientWidth-16-leading.current.getBoundingClientRect().width-40-16-(context?contextMinWidth+16:0);
   const next=fitToolbar(actions.map((a:any,i:number)=>({id:a.id,width:widths[i]||0,priority:a.priority})),available,8).hidden;
   setHidden(old=>old.join('|')===next.join('|')?old:next);
  };
  const observer=new ResizeObserver(update);for(const el of [row.current,leading.current,measure.current,menu.current])if(el)observer.observe(el);
  document.fonts?.ready.then(update);update();return()=>observer.disconnect();
 },[actions,!!context,contextMinWidth]);
 return <Smooth.div className="monitor-toolbar adaptive-toolbar" ref={row}>
  <Smooth.div ref={leading} className="toolbar-primary">{primary}</Smooth.div>
  {context&&<Smooth.div ref={contextSlot} className="toolbar-context" style={{minWidth:contextMinWidth}}>{context}</Smooth.div>}
  <Smooth.div className="toolbar-secondary">{actions.filter((a:any)=>!hidden.includes(a.id)).map((a:any)=>action(a))}</Smooth.div>
  <Smooth.div ref={menu} className="toolbar-overflow" style={!hidden.length?{display:'none'}:{}}><IconButton name="dots-vertical" label="Другие действия" aria-haspopup="menu" onClick={e=>onOverflow(hidden,e.currentTarget)}/></Smooth.div>
  <Smooth.div ref={measure} className="toolbar-measure" aria-hidden="true" inert>{actions.map((a:any)=>action(a,true))}</Smooth.div>
 </Smooth.div>;
}
