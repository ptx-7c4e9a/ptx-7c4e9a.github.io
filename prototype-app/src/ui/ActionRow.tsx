import {Children,Fragment,isValidElement,useLayoutEffect,useRef,useState} from 'react';
import Smooth from './Smooth';

// Compare the actual, unwrapped button widths after fonts load and on resize.
// A narrow row becomes a full-width stack, with its main action first.
export default function ActionRow({children,className=''}:any){
 const ref=useRef<HTMLDivElement>(null),[stacked,setStacked]=useState(false);
 useLayoutEffect(()=>{
  const row=ref.current;if(!row)return;let active=true;
  const measure=()=>{
   if(!active||!row.clientWidth)return;
   const buttons=Array.from(row.children).filter((node):node is HTMLElement=>node instanceof HTMLElement&&node.classList.contains('button'));
   if(buttons.length<2){setStacked(false);return;}
   const available=(row.clientWidth-parseFloat(getComputedStyle(row).columnGap||'0')*(buttons.length-1))/buttons.length;
   const fits=buttons.every(button=>{
    const copy=button.cloneNode(true) as HTMLElement;
    copy.setAttribute('aria-hidden','true');copy.inert=true;
    Object.assign(copy.style,{position:'fixed',left:'-10000px',top:'0',width:'max-content',maxWidth:'none',minWidth:'0',flex:'none',whiteSpace:'nowrap',visibility:'hidden',transition:'none'});
    row.appendChild(copy);const width=copy.getBoundingClientRect().width;copy.remove();
    return width<=available+.5;
   });
   setStacked(!fits);
  };
  const observer=new ResizeObserver(measure);observer.observe(row);document.fonts?.ready.then(measure);measure();
  return()=>{active=false;observer.disconnect();};
 },[children]);
 const items=Children.toArray(children).flatMap((child:any)=>isValidElement(child)&&child.type===Fragment?Children.toArray((child.props as any).children):[child]);
 const ordered=stacked?[...items].sort((a:any,b:any)=>Number(['primary','gray-primary'].includes(b?.props?.tone))-Number(['primary','gray-primary'].includes(a?.props?.tone))):items;
 return <Smooth.div ref={ref} className={`action-row ${stacked?'stacked':''} ${className}`}>{ordered}</Smooth.div>;
}
