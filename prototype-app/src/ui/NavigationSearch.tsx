import {useRef,useState} from 'react';
import {Search} from './index';
import Smooth from './Smooth';
import PopoverSurface,{PopoverPresence} from './PopoverSurface';

export default function NavigationSearch({labels,onNavigate}:any){
 const [query,setQuery]=useState(''),[open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null);
 const results=labels.filter(([,title]:string[])=>title.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')));
 return <Smooth.div ref={root} className="header-search" data-tooltip="Найти раздел кабинета по названию"
  onFocus={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(true);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}
  onClick={e=>{if((e.target as Element).matches('input'))setOpen(true);}}
  onKeyDown={e=>{
   if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);root.current?.querySelector('input')?.focus();}
   else if(['ArrowDown','ArrowUp'].includes(e.key)&&!open&&query){
    e.preventDefault();setOpen(true);const last=e.key==='ArrowUp';requestAnimationFrame(()=>{const buttons=root.current?.querySelectorAll<HTMLButtonElement>('.global-results button');if(buttons?.length)buttons[last?buttons.length-1:0].focus();});
   }
   else if((['ArrowDown','ArrowUp'].includes(e.key)||!!(e.target as Element).closest('.global-results')&&['Home','End'].includes(e.key))&&open&&query){
    const buttons=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.global-results button')||[]);if(!buttons.length)return;
    e.preventDefault();const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:index<0?(e.key==='ArrowUp'?buttons.length-1:0):(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();
   }
  }}>
  <Search value={query} onChange={(value:string)=>{setQuery(value);setOpen(true);}} placeholder="Поиск по кабинету"/>
  <PopoverPresence>{open&&query&&<PopoverSurface key="navigation-results" className="global-results" role="region" aria-label="Результаты поиска по кабинету" style={{transformOrigin:'left top'}}>
   {results.map(([id,title]:string[])=><Smooth.button key={id} onClick={()=>{onNavigate(id);setQuery('');setOpen(false);}}>{title}</Smooth.button>)}
   {!results.length&&<p>Раздел не найден</p>}
  </PopoverSurface>}</PopoverPresence>
 </Smooth.div>;
}
