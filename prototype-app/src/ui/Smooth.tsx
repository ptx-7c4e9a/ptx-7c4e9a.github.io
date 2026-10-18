import React,{forwardRef,useLayoutEffect,useRef,useState} from 'react';
import {getSvgPath} from 'figma-squircle';

// Explicit React-owned elements. One size observer; no DOM scans or mutation observer.
const callbacks=new Map<Element,()=>void>();
const resize=new ResizeObserver(entries=>{for(const entry of entries)callbacks.get(entry.target)?.();});
let resizeFrame=0;
const refresh=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>callbacks.forEach(draw=>draw()));};
window.addEventListener('resize',refresh);
if(import.meta.hot)import.meta.hot.dispose(()=>{resize.disconnect();callbacks.clear();cancelAnimationFrame(resizeFrame);window.removeEventListener('resize',refresh);});
const voidTags=new Set(['input','textarea','img']);
// Also used by our own imperative map labels; SDK-owned controls stay untouched.
export function applyCornerSmoothing(el:HTMLElement,params:any){
 const path=getSvgPath({...params,cornerSmoothing:1,preserveSmoothing:true});
 // Every painted surface uses only its own contour. An outside-preserving
 // evenodd ring also preserves composited paint/shadows around the corners.
 // External elevation belongs on an unpainted parent, as with popovers.
 el.style.clipPath=`path("${path}")`;el.dataset.cornerSmoothing='100';
}
function intrinsic(tag:string){
 const Element=forwardRef<any,any>(function FigmaContour({children,className='',...props},forwarded){
  const node=useRef<HTMLElement|null>(null),cache=useRef(''),[outline,setOutline]=useState<any>(null);
  const attach=(el:HTMLElement|null)=>{node.current=el;if(typeof forwarded==='function')forwarded(el);else if(forwarded)forwarded.current=el;};
  useLayoutEffect(()=>{
   const el=node.current;if(!el)return;
   const draw=()=>{
    const css=getComputedStyle(el);
    // CSS dimensions retain fractions; offsetWidth/Height round to integers and
    // can leave a strip of composited paint outside the calculated contour.
    const w=css.boxSizing==='border-box'?(parseFloat(css.width)||el.offsetWidth):el.offsetWidth;
    const h=css.boxSizing==='border-box'?(parseFloat(css.height)||el.offsetHeight):el.offsetHeight;if(!w||!h)return;
    const radii=[css.borderTopLeftRadius,css.borderTopRightRadius,css.borderBottomRightRadius,css.borderBottomLeftRadius].map(value=>value.includes('%')?Math.min(w,h)*parseFloat(value)/100:parseFloat(value)||0);
    const circle=Math.abs(w-h)<1&&Math.min(...radii)>=w/2;
    const key=[w,h,...radii,circle].join('/');if(cache.current===key)return;cache.current=key;
    if(!radii.some(Boolean)||circle){el.style.removeProperty('clip-path');el.removeAttribute('data-corner-smoothing');setOutline(null);return;}
    const params={width:w,height:h,topLeftCornerRadius:radii[0],topRightCornerRadius:radii[1],bottomRightCornerRadius:radii[2],bottomLeftCornerRadius:radii[3],cornerSmoothing:1,preserveSmoothing:true};
    // Contain all painted layers within the same Figma contour.
    applyCornerSmoothing(el,params);
    const control=el.matches('.button,.select-control,.datetime-trigger,.search,.password-field,.time-number,.toolbar-action-resettable');
    const textField=tag==='textarea'||tag==='input'&&!['checkbox','radio','range'].includes((el as HTMLInputElement).type);
    if(control||textField){
     const inset=getSvgPath({...params,width:Math.max(1,w-3),height:Math.max(1,h-3),topLeftCornerRadius:Math.max(0,radii[0]-1.5),topRightCornerRadius:Math.max(0,radii[1]-1.5),bottomRightCornerRadius:Math.max(0,radii[2]-1.5),bottomLeftCornerRadius:Math.max(0,radii[3]-1.5)});
     if(textField){
      const image=(color:string)=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='${inset}' transform='translate(1.5 1.5)' fill='none' stroke='${color}' stroke-width='1.5'/></svg>`)}")`;
      el.style.setProperty('--smooth-focus-stroke',image(css.getPropertyValue('--accent').trim()));
      el.style.setProperty('--smooth-error-stroke',image('#ea5679'));
     }else{if(css.position==='static')el.style.position='relative';setOutline({w,h,path:inset});}
    }
   };
   callbacks.set(el,draw);resize.observe(el);draw();
   return()=>{callbacks.delete(el);resize.unobserve(el);};
  },[className,props.style?.borderRadius]);
  return React.createElement(tag,{...props,className,ref:attach},...(voidTags.has(tag)||props.dangerouslySetInnerHTML?[]:[children,outline&&<svg key="contour" className="smooth-outline" viewBox={`0 0 ${outline.w} ${outline.h}`} aria-hidden="true" focusable="false"><path d={outline.path} transform="translate(1.5 1.5)"/></svg>]));
 });
 (Element as any).elementTag=tag;Element.displayName=`Smooth.${tag}`;return Element;
}
const Smooth=Object.fromEntries(['div','span','button','section','aside','header','footer','form','article','label','input','textarea','a','img','i','b','fieldset'].map(tag=>[tag,intrinsic(tag)])) as Record<string,any>;
export default Smooth;
