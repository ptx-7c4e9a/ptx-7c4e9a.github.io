import {useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import Smooth from '../ui/Smooth';
import PopoverSurface from '../ui/PopoverSurface';
import optical from '../data/optical-scale.json';
import {Badge,Button,IconButton,Search} from '../ui';
import {transportImage,transportType} from '../ui/Transport';
import {fleetOwnership,fleetOwnershipLabel,mapPreviewPlacement,vehicleTypeLabel} from './map-vehicle-state.mjs';
import useMapReadings from './useMapReadings';
import './map-vehicle-preview.css';

// The SDK owns only the geographic anchor. React owns the complete floating surface.
// A body portal keeps the card out of the map's clipped/tiled canvas.
export function MapOverlay({anchor,children,onClose,label,interactive=true}:any){
 const ref=useRef<HTMLElement>(null),close=useRef(onClose);
 close.current=onClose;
 useEffect(()=>{
  const panel=ref.current;if(!panel)return;
  let frame=0,last='',frames=0;const previous=document.activeElement as HTMLElement;
  const place=()=>{
   if(panel.isConnected&&anchor?.isConnected){
    const a=anchor.getBoundingClientRect(),r=panel.getBoundingClientRect();
    const inspector=document.querySelector<HTMLElement>('.map-inspector[data-inspector=vehicle]')?.getBoundingClientRect();
    const right=interactive&&inspector&&inspector.width>0&&inspector.left>=r.width+24?inspector.left-12:window.innerWidth;
    const p=mapPreviewPlacement({x:a.left,y:a.top},{left:0,top:0,right,bottom:window.innerHeight},{width:r.width,height:r.height});
    const value=Math.round(p.left)+','+Math.round(p.top);
    if(value!==last){panel.style.left=p.left+'px';panel.style.top=p.top+'px';last=value;}
    panel.style.visibility='visible';
    if(!frames++&&interactive)panel.focus({preventScroll:true});
   }
   frame=requestAnimationFrame(place);
  };
  frame=requestAnimationFrame(place);
  const outside=(event:PointerEvent)=>{const target=event.target as Element;if(!panel.contains(target)&&!target.closest?.('.vehicle-marker,.cluster-marker'))close.current(false);};
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close.current();}};
  if(interactive){document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',key,true);}
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',key,true);if(panel.contains(document.activeElement)&&previous?.isConnected)previous.focus({preventScroll:true});};
 },[anchor,interactive]);
 return createPortal(<PopoverSurface as="section" ref={ref} role={interactive?"dialog":"tooltip"} tabIndex={interactive?-1:undefined} aria-modal={interactive?"false":undefined} data-interactive={interactive} aria-label={label} data-theme="light" className="map-vehicle-preview" style={{visibility:'hidden',pointerEvents:interactive?undefined:'none'}}>{children}</PopoverSurface>,document.body);
}

export default function MapVehiclePreview({vehicle,anchor,pinned,onPin,onClose,interactive=false}:any){
 const title=useId(),readings=useMapReadings(vehicle),fresh=readings.fresh,kind=fleetOwnership(vehicle);
 const number=(value:any)=>typeof value==='number'?value.toLocaleString('ru-RU',{maximumFractionDigits:1}):'—';
 const art=optical.assets.find((a:any)=>a.type===transportType(vehicle)&&a.view==='card');const [x0,y0,x1,y1]=art?.bbox||[0,0,1024,1024];
 return <MapOverlay anchor={anchor} onClose={onClose} interactive={interactive} label={'Транспорт '+vehicle.plate}>
  <header className="map-preview-heading"><div><h3 id={title}>{vehicleTypeLabel(vehicle)}</h3><div className="map-preview-identification"><p className="map-preview-plate">{vehicle.plate}</p><Badge className="map-fleet-badge" data-fleet={kind}>{fleetOwnershipLabel(vehicle)}</Badge></div></div>{interactive&&<IconButton name="close" iconSize={20} label="Закрыть окно ТС" onClick={onClose}/>}</header>
  <svg className="map-preview-art" viewBox={[x0,y0,x1-x0,y1-y0].join(' ')} role="img" aria-label={vehicle.model}><image href={transportImage(vehicle,'card','light')} width={art?.size[0]||1024} height={art?.size[1]||1024}/></svg>
  <div className="map-preview-status" data-state={readings.state}><p className="map-preview-model">{vehicle.model}</p><Badge className="map-motion-badge" data-tone={readings.state}><i aria-hidden="true"/>{readings.state==='moving'?'В движении':readings.state==='idle'?'Стоит':readings.label}</Badge></div>
  <dl className="map-preview-metrics">
   <div className="map-preview-speed"><dt>{fresh?'Текущая скорость':'Скорость недоступна'}</dt><dd>{number(readings.speed)}{fresh&&<small>км/ч</small>}</dd></div>
   <div><dt>{readings.fuelLabel}</dt><dd>{number(readings.fuel)}{readings.fuel!==null&&<small>{readings.fuelUnit}</small>}</dd></div>
   <div><dt>Напряжение<br/>питания</dt><dd>{number(readings.voltage)}{readings.voltage!==null&&<small>В</small>}</dd></div>
   <div><dt>Обороты<br/>двигателя</dt><dd>{number(readings.rpm)}{readings.rpm!==null&&<small>об/мин</small>}</dd></div>
  </dl>
  <p className="map-preview-data-note">{readings.replay?'Демо · '+readings.clock+' · ×60':fresh?'Демо · последний сигнал':vehicle.signal||'Время сигнала неизвестно'}</p>
  {interactive&&<footer className="map-preview-actions"><Button icon="pin" tone={pinned?'gray-primary':'primary'} aria-pressed={pinned} onClick={onPin}>{pinned?'Открепить ТС':'Закрепить ТС'}</Button></footer>}
 </MapOverlay>;
}

export function MapClusterPreview({vehicles,anchor,onClose,onSelect}:any){
 const [query,setQuery]=useState(''),rows=vehicles.filter((v:any)=>(v.plate+' '+v.model).toLowerCase().includes(query.toLowerCase()));
 const moving=vehicles.filter((v:any)=>v.speed>0).length;
 return <MapOverlay anchor={anchor} onClose={onClose} label="Транспорт в группе">
  <header className="map-preview-heading"><div><h3>{moving===0?'ТС на базе':moving===vehicles.length?'Автоколонна':'Транспорт в группе'}</h3><p>{vehicles.length} ТС{vehicles.some((v:any)=>v.demoScenario)?' · демонстрационный сценарий':' в группе'}</p></div><IconButton name="close" iconSize={20} label="Закрыть группу ТС" onClick={onClose}/></header>
  <p className="map-cluster-explanation">Выберите машину, чтобы увидеть её положение и текущие показатели.</p>
  <Search value={query} onChange={setQuery} placeholder="Найти госномер в группе"/>
  <div className="map-cluster-list">{rows.map((v:any)=><button type="button" key={v.id} onClick={()=>onSelect(v.id)}><img src={transportImage(v,'card','light')} alt=""/><span><b>{v.plate}</b><small>{fleetOwnershipLabel(v)}</small></span><span>{v.speed>0?v.speed+' км/ч':'Стоит'}</span></button>)}{!rows.length&&<p>В этой группе ТС не найдено.</p>}</div>
 </MapOverlay>;
}
