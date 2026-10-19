import {useCallback,useContext,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import Smooth from '../ui/Smooth';
import {Button,Icon,IconButton} from '../ui';
import PopoverSurface,{PopoverPresence,usePopoverPresent} from '../ui/PopoverSurface';
import {AppThemeContext} from '../ui/ThemeTransition';

function SelectedVehiclesPopover({anchor,vehicles,selectedId,onChoose,onRemove,onClear,onClose}:any){
 const ref=useRef<HTMLDivElement>(null),list=useRef<HTMLDivElement>(null),closeButton=useRef<HTMLButtonElement>(null),pendingFocus=useRef<number|null>(null);
 const theme=useContext(AppThemeContext),present=usePopoverPresent(),[position,setPosition]=useState<any>(null);
 useLayoutEffect(()=>{
  if(!ref.current)return;
  const r=anchor.getBoundingClientRect(),width=ref.current.offsetWidth,height=ref.current.offsetHeight;
  const below=r.bottom+8+height<=innerHeight-16;
  setPosition({left:Math.max(16,Math.min(r.left,innerWidth-width-16)),top:Math.max(16,Math.min(below?r.bottom+8:r.top-height-8,innerHeight-height-16)),transformOrigin:below?'left top':'left bottom'});
 },[anchor,vehicles.length]);
 useEffect(()=>{
  if(!present||!position)return;
  (list.current?.querySelector<HTMLButtonElement>('[data-pin-choice]:not(:disabled)')||closeButton.current)?.focus();
  const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node)&&!anchor.contains(e.target))onClose(false);};
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}};
  const focus=(e:FocusEvent)=>{if(!ref.current?.contains(e.target as Node)&&!anchor.contains(e.target))onClose(false);};
  const resized=()=>onClose();
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);document.addEventListener('focusin',focus);window.addEventListener('resize',resized);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);document.removeEventListener('focusin',focus);window.removeEventListener('resize',resized);};
 },[present,!!position]);
 useLayoutEffect(()=>{
  if(pendingFocus.current===null)return;
  const options=Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[data-pin-choice]:not(:disabled)')||[]);
  (options[Math.min(pendingFocus.current,options.length-1)]||closeButton.current)?.focus();pendingFocus.current=null;
 },[vehicles.length]);
 return createPortal(<PopoverSurface ref={ref} role="dialog" aria-modal="false" aria-label="Выбранные ТС" data-theme={theme} className="pinned-popover" style={{...position,visibility:position?'visible':'hidden'}}>
  <Smooth.header className="pinned-popover-heading"><h3>Выбранные ТС</h3></Smooth.header>
  <Smooth.div className="pinned-popover-list" ref={list}>
   {vehicles.length?vehicles.map((v:any,index:number)=><Smooth.div key={v.id} className="pinned-popover-row" data-active={v.id===selectedId}>
    <Smooth.button data-pin-choice="" className="pin-option" disabled={!v.available} aria-current={v.id===selectedId?'true':undefined} data-tooltip={v.available?undefined:'ТС скрыто текущим поиском или фильтрами'} aria-label={'Показать выбранное ТС '+v.plate} onClick={()=>{onClose();onChoose(v.id);}}>{v.plate}</Smooth.button>
    <IconButton className="icon-button pin-remove" name="close" iconSize={16} label={'Удалить '+v.plate+' из выбранных'} onClick={()=>{pendingFocus.current=index;onRemove(v.id);}}/>
   </Smooth.div>):<Smooth.div className="pinned-popover-empty"><p>Нет выбранных ТС</p><small>Нажмите на машину на карте или закрепите её в карточке.</small></Smooth.div>}
  </Smooth.div>
  <Smooth.footer className="pinned-popover-footer">
   <Button tone="outline" className="pin-reset" disabled={!vehicles.length} aria-label="Сбросить выбранные ТС" onClick={()=>{onClose();onClear();}}>Сбросить</Button>
   <Smooth.button ref={closeButton} type="button" className="button gray-tertiary m pin-close" aria-label="Закрыть список выбранных ТС" onClick={()=>onClose()}><Smooth.span>Закрыть</Smooth.span></Smooth.button>
  </Smooth.footer>
 </PopoverSurface>,document.body);
}

export default function PinnedVehicles({vehicles,selectedId,onChoose,onRemove,onClear}:any){
 const trigger=useRef<HTMLButtonElement>(null),[open,setOpen]=useState(false);
 const close=useCallback((restore=true)=>{setOpen(false);if(restore)trigger.current?.focus();},[]);
 return <>
  <Smooth.div className="pinned-control"><Smooth.button ref={trigger} type="button" className={'icon-button pinned-toggle '+(open?'active':'')} aria-haspopup="dialog" aria-expanded={open} aria-label={'Выбранные ТС: '+vehicles.length} data-tooltip={'Выбранные ТС: '+vehicles.length} onClick={()=>setOpen(!open)}><Icon name="pin-list" size={20}/></Smooth.button><Smooth.span className="pin-count" aria-hidden="true">{vehicles.length}</Smooth.span></Smooth.div>
  <PopoverPresence>{open&&trigger.current&&<SelectedVehiclesPopover anchor={trigger.current} vehicles={vehicles} selectedId={selectedId} onChoose={onChoose} onRemove={onRemove} onClear={onClear} onClose={close}/>}</PopoverPresence>
 </>;
}
