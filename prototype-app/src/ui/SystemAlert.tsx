import {ALERT_VISIBLE_MS,ALERT_MIN_INTERVAL_MS,nextAlertDelay,pickAlertIndex} from './alert-schedule.mjs';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import Smooth from './Smooth';
import {Icon} from './index';

export type AlertTone='success'|'info'|'warning'|'alert';
export type AlertMessage={tone:AlertTone;title:string;body?:string};
const eventName='proto-system-alert';
export function notifyAlert(message:AlertMessage){
 window.dispatchEvent(new CustomEvent(eventName,{detail:message}));
}

// A transient result of an operation. Persistent task/resource state stays in the record.
// Live source: Alert / M, 10581:281, in zRLM56kfYe5yTjNEy5GtZW.
export default function SystemAlert({theme,scope,messages=[]}: {theme:string;scope:string;messages?:AlertMessage[]}){
 const [message,setMessage]=useState<(AlertMessage&{id:number})|null>(null);
 const [leaving,setLeaving]=useState(false),[announcement,setAnnouncement]=useState('');
 const sequence=useRef(0),remaining=useRef(ALERT_VISIBLE_MS),started=useRef(0),paused=useRef(false);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const pool=useRef(messages),lastShown=useRef(-Infinity),previous=useRef(-1);pool.current=messages;
 const clear=()=>{timers.current.forEach(clearTimeout);timers.current=[];};
 const dismiss=()=>{clear();paused.current=false;setMessage(null);setAnnouncement('');};
 const schedule=()=>{
  clear();started.current=performance.now();
  timers.current=[setTimeout(()=>setLeaving(true),Math.max(0,remaining.current-180)),setTimeout(dismiss,remaining.current)];
 };
 useEffect(()=>{
  const show=(event:Event)=>{
   const next=(event as CustomEvent<AlertMessage>).detail;
   clear();lastShown.current=performance.now();remaining.current=ALERT_VISIBLE_MS;paused.current=false;setLeaving(false);
   setMessage({...next,id:++sequence.current});setAnnouncement([next.title,next.body].filter(Boolean).join('. '));schedule();
  };
  window.addEventListener(eventName,show);
  return()=>{window.removeEventListener(eventName,show);clear();};
 },[]);
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>;
  const plan=(delay=nextAlertDelay())=>{timer=setTimeout(tick,delay);};
  const tick=()=>{
   const focused=document.activeElement as HTMLElement;
   const overlay=[...document.querySelectorAll('[role="dialog"],[role="menu"],[role="listbox"]')].some(e=>e.getClientRects().length&&!e.closest('[inert]'));
   const typing=focused?.matches('input,textarea,[contenteditable="true"]');
   if(document.visibilityState!=='visible'||overlay||typing||paused.current||performance.now()-lastShown.current<ALERT_MIN_INTERVAL_MS){plan(10000);return;}
   if(pool.current.length){const index=pickAlertIndex(pool.current.length,previous.current);previous.current=index;notifyAlert(pool.current[index]);}
   plan();
  };
  plan();return()=>clearTimeout(timer);
 },[]);
 useEffect(()=>{dismiss();},[scope]);
 const pause=()=>{if(!paused.current){remaining.current=Math.max(180,remaining.current-(performance.now()-started.current));paused.current=true;clear();setLeaving(false);}};
 const resume=()=>{if(paused.current){paused.current=false;schedule();}};
 return createPortal(<div className="system-alert-host" data-theme={theme}>
  <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  {message&&<Smooth.section key={message.id} className={'system-alert '+message.tone+(leaving?' leaving':'')} data-alert-tone={message.tone}
   aria-label={message.title} onMouseEnter={pause} onMouseLeave={event=>{if(!event.currentTarget.contains(document.activeElement))resume();}}
   onFocus={pause} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)&&!event.currentTarget.matches(':hover'))resume();}}>
   <Icon name={message.tone==='success'?'check':'info'} size={20}/>
   <div className="system-alert-copy"><strong>{message.title}</strong>{message.body&&<p>{message.body}</p>}</div>
   <Smooth.button type="button" className="system-alert-close" aria-label="Закрыть уведомление" onClick={dismiss}><Icon name="close" size={20}/></Smooth.button>
  </Smooth.section>}
 </div>,document.body);
}
