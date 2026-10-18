import {createContext,useEffect,useRef} from 'react';
import {flushSync} from 'react-dom';

export const AppThemeContext=createContext('light');

// C152: capture the entire old/new interface once. Child CSS transitions cannot
// start separate clocks or leave text, images and portal surfaces a theme behind.
export function useThemeTransition(onTheme:(theme:string)=>void){
 const active=useRef<any>(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;active.current?.skipTransition();document.documentElement.classList.remove('theme-atomic');};},[]);
 return (theme:string)=>{
  const root=document.documentElement;
  active.current?.skipTransition();
  const apply=()=>{if(mounted.current)flushSync(()=>onTheme(theme));};
  document.dispatchEvent(new Event('prototype-theme-start'));
  root.classList.add('theme-atomic');
  const native=(document as any).startViewTransition;
  if(!native||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   root.dataset.themeTransitionEngine='instant';apply();
   requestAnimationFrame(()=>root.classList.remove('theme-atomic'));return;
  }
  root.dataset.themeTransitionEngine='native';
  // The browser suspends rendering inside this callback; waiting for an rAF
  // here would stall capture until the UA times the transition out.
  const transition=native.call(document,apply);
  active.current=transition;
  transition.ready.catch(()=>{});
  transition.updateCallbackDone.catch(()=>{});
  const finish=()=>{if(active.current===transition){active.current=null;root.classList.remove('theme-atomic');}};
  transition.finished.then(finish,finish);
 };
}
