import {createContext,forwardRef,isValidElement,useContext,useLayoutEffect,useRef,useState} from 'react';
import {useReducedMotion} from 'motion/react';
import Smooth from './Smooth';

const PresentContext=createContext(true);
export const usePopoverPresent=()=>useContext(PresentContext);
export function PopoverPresence({children}:any){
 const open=isValidElement(children),previous=useRef<any>(null),[retained,setRetained]=useState(false),reduced=useReducedMotion();
 if(open)previous.current=children;
 useLayoutEffect(()=>{
  if(open){setRetained(true);return;}
  const timer=setTimeout(()=>setRetained(false),reduced?0:220);
  return()=>clearTimeout(timer);
 },[open,reduced]);
 return <PresentContext.Provider value={open}>{open?children:retained?previous.current:null}</PresentContext.Provider>;
}

// A closing surface loses focus and hit testing immediately. Reopening cancels removal.
export default forwardRef<any,any>(function PopoverSurface({as='div',className='',style,...props},ref){
 const present=usePopoverPresent(),reduced=useReducedMotion(),[shown,setShown]=useState(false),Surface=as==='section'?Smooth.section:Smooth.div;
 useLayoutEffect(()=>{if(reduced){setShown(true);return;}const frame=requestAnimationFrame(()=>setShown(true));return()=>cancelAnimationFrame(frame);},[reduced]);
 const visible=present&&shown,duration=reduced?0:present?300:220;
 // Filter the already clipped surface, so the shadow follows its Figma contour.
 // The positioning shell paints nothing; the inner surface owns padding/scrolling.
 return <div className={'popover-surface '+className+' popover-shadow-frame'} data-theme={props['data-theme']}
  data-popover-state={!present?'closing':shown?'open':'opening'} inert={!present}
  style={{...style,pointerEvents:present?style?.pointerEvents:'none',opacity:visible?1:0,
   transform:visible||reduced?'none':present?'translateY(4px) scale(.98)':'translateY(3px) scale(.985)',
   transition:`opacity ${duration}ms cubic-bezier(.16,1,.3,1),transform ${duration}ms cubic-bezier(.16,1,.3,1)`}}>
  <Surface {...props} ref={ref} className={'popover-surface '+className}
  data-popover-state={!present?'closing':shown?'open':'opening'} data-reduced-motion={!!reduced}
  inert={!present||props.inert} aria-hidden={!present||props['aria-hidden']}
  style={{...style,position:'relative',left:'auto',top:'auto',right:'auto',bottom:'auto',width:'100%',margin:0,
   pointerEvents:present?style?.pointerEvents:'none',opacity:1,transform:'none',transition:'none'}}/>
 </div>;
});
