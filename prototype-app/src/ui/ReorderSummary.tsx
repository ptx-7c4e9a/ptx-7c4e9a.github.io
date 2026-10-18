import Smooth from './Smooth';
import {useEffect,useId,useRef,useState} from 'react';
import {Icon} from './index';
import {animate,Reorder,useDragControls,useMotionValue,useReducedMotion} from 'motion/react';

// Layout boxes and pointer velocity avoid hit-testing animated neighbours.
function ReorderCard({item,children,active,onPrepare,onStart,onSave,onCancel,onKey,helpId,group,reduced,dragFrom,axis}:any){
 const controls=useDragControls(),x=useMotionValue(0),y=useMotionValue(0),dragging=useRef(false),suppressClick=useRef(false);
 const cancel=()=>{controls.cancel();dragging.current=false;onCancel();for(const value of [x,y])animate(value,0,{duration:reduced?0:.2,ease:[.16,1,.3,1]});};
 useEffect(()=>()=>controls.cancel(),[controls]);
 useEffect(()=>{if(dragging.current)cancel();},[axis]);
 return <Reorder.Item as="div" value={item.id} data-summary-id={item.id} className="summary-slot"
  layout="position" dragListener={false} dragControls={controls} dragConstraints={group} dragElastic={0} dragMomentum={false}
  style={{x,y,touchAction:dragFrom==='header'?'pan-y':'none'}} transition={{layout:{duration:reduced?0:.24,ease:[.16,1,.3,1]}}}
  dragTransition={{bounceStiffness:600,bounceDamping:50}}
  onPointerDownCapture={e=>{
   if(e.button!==0||!e.isPrimary)return;suppressClick.current=false;
   if((e.target as HTMLElement).closest('.kpi-info,input,select,textarea,a,[data-no-reorder]'))return;
   if(dragFrom==='header'&&!(e.target as HTMLElement).closest('.summary-drag-handle')&&(!(e.target as HTMLElement).closest('header')||(e.target as HTMLElement).closest('button')))return;
   onPrepare();controls.start(e,{distanceThreshold:6});
  }}
  onDragStart={()=>{dragging.current=true;suppressClick.current=true;onStart(item.id);document.dispatchEvent(new Event('prototype-drag-start'));}}
  onDragEnd={()=>{dragging.current=false;onSave();}}
  onPointerCancel={()=>{if(dragging.current)cancel();}}
  onKeyDownCapture={e=>{if(e.key==='Escape'&&dragging.current){e.preventDefault();e.stopPropagation();cancel();}}}
  onClickCapture={e=>{if(suppressClick.current&&e.detail!==0){e.preventDefault();e.stopPropagation();}}}>
  <Smooth.div className={'summary-card '+(item.className||'')+' '+(active===item.id?'reordering':'')}>
   {children}
   <Smooth.button type="button" className="summary-drag-handle" aria-label={'Переместить '+item.label}
    aria-pressed={active===item.id} aria-describedby={helpId}
    data-tooltip={(dragFrom==='header'?'Зажмите заголовок или две полоски':'Зажмите карточку или две полоски')+' и перетащите. Клавиатура: Пробел, стрелки, Enter'}
    onKeyDown={e=>onKey(e,item.id)}><Icon name="drag" size={20}/></Smooth.button>
  </Smooth.div>
 </Reorder.Item>;
}

export default function ReorderSummary({items,storageKey='proto-ektp-fuel-summary-order',className='fuel-summary',renderItem,dragFrom='surface'}:any){
 const reduced=useReducedMotion(),helpId=useId(),group=useRef<HTMLDivElement>(null);
 const stackedPanels=className==='dashboard-panels',query='(max-width: 900px)';
 const [stacked,setStacked]=useState(()=>stackedPanels&&matchMedia(query).matches);
 useEffect(()=>{if(!stackedPanels)return;const media=matchMedia(query),update=()=>setStacked(media.matches);media.addEventListener('change',update);update();return()=>media.removeEventListener('change',update);},[stackedPanels]);
 const axis=stacked?'y':'x';
 const [order,setOrder]=useState<string[]>(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');return Array.isArray(saved)&&saved.length===items.length&&items.every((i:any)=>saved.includes(i.id))?saved:items.map((i:any)=>i.id);}catch{return items.map((i:any)=>i.id);}});
 const [active,setActive]=useState(''),[announcement,setAnnouncement]=useState('');
 const startOrder=useRef<string[]>([]),current=useRef(order);current.current=order;
 useEffect(()=>{setOrder(prev=>{const filtered=prev.filter(id=>items.some((i:any)=>i.id===id));return [...filtered,...items.filter((i:any)=>!filtered.includes(i.id)).map((i:any)=>i.id)];});},[items.map((i:any)=>i.id).join('|')]);
 function update(next:string[]){current.current=next;setOrder(next);if(active)setAnnouncement(`${items.find((i:any)=>i.id===active)?.label}: позиция ${next.indexOf(active)+1} из ${next.length}`);}
 function save(){localStorage.setItem(storageKey,JSON.stringify(current.current));setActive('');}
 function cancel(){update(startOrder.current);setActive('');setAnnouncement('Перестановка отменена');}
 function key(e:any,id:string){
  if(e.key===' '||e.key==='Enter'){e.preventDefault();if(active===id)save();else{startOrder.current=[...current.current];setActive(id);setAnnouncement('Карточка выбрана. Стрелки меняют позицию, Enter сохраняет, Escape отменяет.');}}
  else if(e.key==='Escape'&&active){e.preventDefault();cancel();}
  else if(active===id&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();const next=[...current.current],from=next.indexOf(id),to=from+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1);
   if(to>=0&&to<next.length){next.splice(from,1);next.splice(to,0,id);update(next);}
  }
 }
 return <Reorder.Group ref={group} as="div" axis={axis} values={order} onReorder={update} className={className}>
  <Smooth.span className="sr-only" role="status" aria-live="polite">{announcement}</Smooth.span>
  {order.map(id=>{const item=items.find((i:any)=>i.id===id);if(!item)return null;return <ReorderCard key={id} item={item} active={active} group={group} reduced={reduced} dragFrom={dragFrom} axis={axis}
   onPrepare={()=>{startOrder.current=[...current.current];}} onStart={setActive} onSave={save} onCancel={cancel} onKey={key} helpId={helpId}>
   {renderItem?renderItem(item):<><Smooth.span>{item.label}</Smooth.span><strong>{item.value}</strong></>}
  </ReorderCard>;})}
  <Smooth.span id={helpId} className="sr-only">{dragFrom==='header'?'Зажмите заголовок или две полоски':'Зажмите карточку'} и перетащите. Клавиатура: Пробел, стрелки, Enter. Escape отменяет.</Smooth.span>
 </Reorder.Group>;
}
