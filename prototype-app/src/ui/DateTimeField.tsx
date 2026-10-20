import Smooth from './Smooth';
import PopoverSurface,{PopoverPresence} from './PopoverSurface';
import TimeNumber from './TimeNumber';
import {createContext,useContext,useEffect,useLayoutEffect,useId,useRef,useState} from 'react';
import {Button,Icon,IconButton} from './index';
import {calendarDays,localDateValue,parseLocalDate,formatDateTimeInput,parseDateTimeInput} from '../logic.mjs';

const DateTimeGroupContext=createContext<any>(null);
export function DateTimeGroup({children,autoAdvance=false}:any){
 const [active,setActive]=useState<string|null|undefined>();
 const root=useRef<HTMLDivElement>(null);
 function advance(id:string){
  if(!autoAdvance)return;
  const fields=Array.from(root.current?.querySelectorAll<HTMLElement>('[data-datetime-field]')||[]);
  const next=fields[fields.findIndex(field=>field.dataset.datetimeField===id)+1];
  if(next)setActive(next.dataset.datetimeField);
 }
 return <DateTimeGroupContext.Provider value={{active,setActive,advance}}><Smooth.div className="period-fields" ref={root}>{children}</Smooth.div></DateTimeGroupContext.Provider>;
}

export default function DateTimeField({value,onChange,id,dateOnly=false,autoOpen=false,editable=false,...props}:any){
 const group=useContext(DateTimeGroupContext),uid=useId(),fieldId=id||uid;
 const [inputText,setInputText]=useState(()=>formatDateTimeInput(value,dateOnly));
 const emittedValue=useRef(value);
 useEffect(()=>{if(value!==emittedValue.current){setInputText(formatDateTimeInput(value,dateOnly));emittedValue.current=value;}},[value,dateOnly]);
 function typeDate(text:string){setInputText(text);const next=parseDateTimeInput(text,dateOnly);emittedValue.current=next;onChange?.({target:{value:next}});}

 const selected=parseLocalDate(value||'2026-10-13T00:00'),[localOpen,setLocalOpen]=useState(autoOpen),[month,setMonth]=useState(new Date(selected.getFullYear(),selected.getMonth(),1)),[focusDate,setFocusDate]=useState(localDateValue(selected).slice(0,10));const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const open=group?(group.active===fieldId||(group.active===undefined&&autoOpen)):localOpen;const setOpen=(next:boolean)=>group?group.setActive(next?fieldId:null):setLocalOpen(next);
 // Keep a grouped calendar mounted while the parent action is being clicked.
 // Collapsing it on pointerdown changes the centred dialog before pointerup.
 useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{const target=e.target as Element;if(group&&target.closest('[role="dialog"]')===root.current?.closest('[role="dialog"]'))return;if(!root.current?.contains(target))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[open]);
 useLayoutEffect(()=>{if(!open)return;const frame=requestAnimationFrame(()=>{if(document.activeElement===root.current?.querySelector('.datetime-editable>input'))return;root.current?.querySelector<HTMLButtonElement>('[data-date="'+localDateValue(selected).slice(0,10)+'"]')?.focus();});return()=>cancelAnimationFrame(frame);},[open]);
 const days=calendarDays(month.getFullYear(),month.getMonth());
 function moveMonth(delta:number){const next=new Date(month.getFullYear(),month.getMonth()+delta,1);setMonth(next);setFocusDate(localDateValue(next).slice(0,10));}
 function updateDay(day:Date){day.setHours(selected.getHours(),selected.getMinutes());onChange?.({target:{value:localDateValue(day)}});setFocusDate(localDateValue(day).slice(0,10));group?.advance(fieldId);}
 function moveDay(day:Date,event:any){const next=new Date(day),key=event.key;if(key==='ArrowLeft')next.setDate(next.getDate()-1);else if(key==='ArrowRight')next.setDate(next.getDate()+1);else if(key==='ArrowUp')next.setDate(next.getDate()-7);else if(key==='ArrowDown')next.setDate(next.getDate()+7);else if(key==='Home')next.setDate(next.getDate()-(next.getDay()+6)%7);else if(key==='End')next.setDate(next.getDate()+6-(next.getDay()+6)%7);else if(key==='PageUp'||key==='PageDown')next.setMonth(next.getMonth()+(key==='PageDown'?1:-1));else return;event.preventDefault();setMonth(new Date(next.getFullYear(),next.getMonth(),1));setFocusDate(localDateValue(next).slice(0,10));requestAnimationFrame(()=>root.current?.querySelector<HTMLButtonElement>('[data-date="'+localDateValue(next).slice(0,10)+'"]')?.focus());}
 return <Smooth.div className="datetime-field" data-datetime-field={fieldId} ref={root} onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);trigger.current?.focus();}}}>{editable?<Smooth.div className="datetime-trigger datetime-editable" data-open={open||undefined}>
  <Smooth.button ref={trigger} type="button" className="icon-button date-calendar-action" aria-label="Открыть календарь" data-tooltip="Выбрать дату в календаре" aria-expanded={open} aria-controls={fieldId+'-calendar'} onClick={()=>{setOpen(!open);setMonth(new Date(selected.getFullYear(),selected.getMonth(),1));setFocusDate(localDateValue(selected).slice(0,10));}}><Icon name="calendar" size={24}/></Smooth.button>
  <input {...props} id={fieldId} type="text" value={inputText} placeholder={dateOnly?'ДД.ММ.ГГГГ':'ДД.ММ.ГГГГ ЧЧ:ММ'} aria-describedby={fieldId+'-format'} onFocus={()=>setOpen(true)} onChange={e=>typeDate(e.target.value)}/>
  <span id={fieldId+'-format'} className="sr-only">{dateOnly?'Формат: день, месяц, год':'Формат: ДД.ММ.ГГГГ ЧЧ:ММ'}</span>
  {inputText&&<IconButton className="icon-button period-clear" name="close" iconSize={24} label="Очистить дату" onClick={()=>{typeDate('');root.current?.querySelector<HTMLInputElement>('input')?.focus();}}/>}
 </Smooth.div>:<Smooth.button {...props} id={fieldId} ref={trigger} type="button" className="datetime-trigger" aria-expanded={open} aria-controls={fieldId+'-calendar'} onClick={()=>{setOpen(!open);setMonth(new Date(selected.getFullYear(),selected.getMonth(),1));setFocusDate((value||'2026-10-13T00:00').slice(0,10));}}><Smooth.span>{value?new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',...(!dateOnly?{hour:'2-digit',minute:'2-digit'}:{})}).format(selected):'Любая дата'}</Smooth.span><Icon name="calendar" size={24}/></Smooth.button>}<PopoverPresence>{open&&<PopoverSurface as="section" key={fieldId} id={fieldId+'-calendar'} className="calendar-popover" aria-label="Календарь"><Smooth.header><IconButton name="back" label="Предыдущий месяц" onClick={()=>moveMonth(-1)}/><Smooth.b aria-live="polite">{new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(month)}</Smooth.b><IconButton name="forward" label="Следующий месяц" onClick={()=>moveMonth(1)}/></Smooth.header><Smooth.div className="calendar-weekdays" aria-hidden="true">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=><Smooth.span key={d}>{d}</Smooth.span>)}</Smooth.div><Smooth.div className="calendar-days" role="grid" aria-label="День месяца">{Array.from({length:6},(_,row)=><Smooth.div role="row" key={row}>{days.slice(row*7,row*7+7).map((day:Date)=>{const iso=localDateValue(day).slice(0,10),chosen=iso===(value||'').slice(0,10);return <Smooth.div role="gridcell" aria-selected={chosen} key={iso}><Smooth.button type="button" data-date={iso} onFocus={()=>setFocusDate(iso)} tabIndex={focusDate===iso?0:-1} className={(chosen?'selected ':'')+(day.getMonth()!==month.getMonth()?'outside':'')} aria-label={new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(day)} onKeyDown={e=>moveDay(day,e)} onClick={()=>updateDay(new Date(day))}>{day.getDate()}</Smooth.button></Smooth.div>;})}</Smooth.div>)}</Smooth.div>{!dateOnly&&<Smooth.div className="calendar-time"><Smooth.span>Время</Smooth.span><TimeNumber label="Часы" value={selected.getHours()} max={23} onChange={(hour:number)=>{const d=new Date(selected);d.setHours(hour);onChange({target:{value:localDateValue(d)}});}}/><Smooth.span>:</Smooth.span><TimeNumber label="Минуты" value={selected.getMinutes()} max={59} onChange={(minute:number)=>{const d=new Date(selected);d.setMinutes(minute);onChange({target:{value:localDateValue(d)}});}}/></Smooth.div>}{!group&&<Button onClick={()=>{setOpen(false);trigger.current?.focus();}}>Готово</Button>}</PopoverSurface>}</PopoverPresence></Smooth.div>;
}
