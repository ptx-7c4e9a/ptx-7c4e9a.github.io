import {StatusBadge} from '../ui';
import optical from '../data/optical-scale.json';
import {transportImage,transportType} from '../ui/Transport';
import {vehicleMotionLabel} from './vehicle-motion.mjs';

// Variant2 moves the existing map preview's content into the single inspector.
// Readings use the same replay source as variant1; missing values stay absent.
export default function VehicleSnapshot({vehicle,theme,readings}:any){
 const number=(value:any)=>typeof value==='number'?value.toLocaleString('ru-RU',{maximumFractionDigits:1}):'—';
 const art=optical.assets.find(a=>a.type===transportType(vehicle)&&a.view==='card'),box=art?.bbox||[0,0,1024,1024];
 const metrics=[[readings.fresh?'Текущая скорость':'Скорость недоступна',readings.speed,readings.fresh?'км/ч':''],[readings.fuelLabel,readings.fuel,readings.fuelUnit],['Напряжение питания',readings.voltage,'В'],['Обороты двигателя',readings.rpm,'об/мин']];
 return <section className="vehicle-snapshot" aria-label="Текущее состояние ТС">
  <svg className="vehicle-detail-art" viewBox={[box[0],box[1],box[2]-box[0],box[3]-box[1]].join(' ')} role="img" aria-label={'3D-изображение ТС в ракурсе три четверти: '+vehicle.model}><image href={transportImage(vehicle,'card',theme)} width={art?.size[0]||1024} height={art?.size[1]||1024}/></svg>
  <div className="vehicle-snapshot-caption"><span>{vehicle.model}</span><StatusBadge value={vehicleMotionLabel(vehicle)}/></div>
  <dl className="vehicle-current-readings">{metrics.map(([label,value,unit])=><div key={label}><dt>{label}</dt><dd>{number(value)}{typeof value==='number'&&<small>{unit}</small>}</dd></div>)}</dl>
  <p className="vehicle-reading-note">{readings.replay?'Демо · '+readings.clock+' · ×60':vehicle.demoScenario?'Демонстрационные данные':vehicle.signal||'Время сигнала неизвестно'}</p>
 </section>;
}
