import Smooth from './Smooth';
import {useEffect,useRef} from 'react';
import {asset} from './index';

export default function LauncherHeading(){
 const root=useRef<HTMLDivElement>(null),copy=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let active=true;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  const measure=()=>{
   if(!active||!ctx||!root.current||!copy.current)return;
   const h=copy.current.querySelector('h1')!,p=copy.current.querySelector('p')!;
   const ink=(element:HTMLElement)=>{
    const style=getComputedStyle(element),rect=element.getBoundingClientRect();ctx.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const m=ctx.measureText(element.textContent||''),lineHeight=parseFloat(style.lineHeight);
    const baseline=rect.top+(lineHeight-m.fontBoundingBoxAscent-m.fontBoundingBoxDescent)/2+m.fontBoundingBoxAscent;
    return {top:baseline-m.actualBoundingBoxAscent,bottom:baseline+m.actualBoundingBoxDescent};
   };
   const top=ink(h).top,bottom=ink(p).bottom,height=bottom-top;
   root.current.style.setProperty('--logo-ink-height',`${height}px`);
   root.current.style.setProperty('--logo-ink-width',`${height*40.0014/33.4656}px`);
   root.current.style.setProperty('--logo-ink-top',`${top-copy.current.getBoundingClientRect().top}px`);
  };
  const observer=new ResizeObserver(measure);if(copy.current)observer.observe(copy.current);
  document.fonts.ready.then(measure);window.addEventListener('resize',measure);measure();return()=>{active=false;observer.disconnect();window.removeEventListener('resize',measure);};
 },[]);
 return <Smooth.div ref={root} className="launcher-heading"><Smooth.span className="launcher-logo-halo"><Smooth.img className="brand-mark" src={asset('launcher.imgLogoLight')} alt="КЛК"/></Smooth.span><Smooth.div ref={copy}><h1>Транспортные системы</h1><p>Выберите продукт или вариант личного кабинета.</p></Smooth.div></Smooth.div>;
}
