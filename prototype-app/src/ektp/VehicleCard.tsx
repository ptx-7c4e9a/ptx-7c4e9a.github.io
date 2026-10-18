import {vehicleMotionLabel,hasFreshPosition} from './vehicle-motion.mjs';
import {useEffect,useRef} from 'react';
import {StatusBadge} from '../ui';
import Smooth from '../ui/Smooth';
import {Button,IconButton,DetailRow,Tabs,Empty} from '../ui';
import {transportImage} from '../ui/Transport';
import history from '../data/ektp-history.json';
import {demoStatistics} from './demo-records.mjs';
import {preparedHistoryRange} from './history-availability.mjs';
import {tripRoutes} from './trip-routes.mjs';

const sensorLabels:Record<string,string>={rpm:'Обороты двигателя',coolant:'Температура ОЖ, °C',battery:'Напряжение, В',pressure:'Давление, бар',ignition:'Зажигание',can:'CAN',gps:'GPS'};
const statisticLabels:Record<string,string>={distanceKm:'Пробег, км',movingHours:'В движении, ч',averageSpeedKmh:'Средняя скорость, км/ч',maximumSpeedKmh:'Максимальная скорость, км/ч'};

export default function VehicleCard({vehicle,theme,tab,onTab,onTelemetry,onHistory,onFuel,range=preparedHistoryRange,historyActive=false,onLocation,onRefresh,refreshing=false}:any){
 const actions=useRef<HTMLDivElement>(null),wasRefreshing=useRef(false);
 useEffect(()=>{if(wasRefreshing.current&&!refreshing&&document.activeElement===document.body)actions.current?.querySelector<HTMLButtonElement>('.vehicle-location')?.focus();wasRefreshing.current=refreshing;},[refreshing]);
 const statistics=demoStatistics(vehicle,range,history.historicalExample);
 const trip=tripRoutes.get(vehicle.id);
 return <>
  <Smooth.img className="vehicle-hero" src={transportImage(vehicle,'card',theme)} alt={vehicle.model}/>
  <Tabs value={tab} onChange={onTab} items={[{id:'info',label:'Информация'},{id:'stats',label:'Статистика'},{id:'sensors',label:'Датчики'}]}/>
  <Smooth.div className="scroll-content">
   {tab==='info'?<dl>{[['Модель',vehicle.model],['Принадлежность',vehicle.kind],['Владелец',vehicle.ownerName],['Город',vehicle.city],['Год выпуска',vehicle.year],['Терминал',vehicle.tracker],['Маршрут рейса',trip?trip.distanceKm.toLocaleString('ru-RU',{maximumFractionDigits:0})+' км':'—'],['Состояние',<StatusBadge value={vehicleMotionLabel(vehicle)}/>],['Скорость',vehicle.speed+' км/ч'],['Последний сигнал',vehicle.signal]].map(([label,value]:any)=><DetailRow key={label} label={label}>{value}</DetailRow>)}</dl>
   :tab==='stats'?statistics?<><h3>За выбранный период</h3><Smooth.div className="telemetry-grid">{Object.entries(statistics).map(([key,value]:any)=><Smooth.div className="telemetry-cell" key={key}><small>{statisticLabels[key]||key}</small><strong>{typeof value==='number'?value.toLocaleString('ru-RU',{maximumFractionDigits:1}):value}</strong></Smooth.div>)}</Smooth.div></>:<Empty text="Нет данных за период" description="Для этого транспорта за выбранный период статистика не получена."/>
   :vehicle.sensors?<Smooth.div className="telemetry-grid">{Object.entries(vehicle.sensors).map(([key,value]:any)=><Smooth.div className="telemetry-cell" key={key}><small>{sensorLabels[key]||key}</small><strong>{typeof value==='boolean'?<StatusBadge value={value?'Есть':'Нет'}/>:String(value)}</strong></Smooth.div>)}</Smooth.div>
   :<Empty text="Последние показания не получены" description="Проверьте историю датчиков через «Показания за период»."/>}
  </Smooth.div>
  <Smooth.div className="vehicle-action-group">
   <Button icon="route" tone="primary" data-tooltip={historyActive?'Вернуться к последнему известному положению транспорта':'Показать маршрут и воспроизвести движение выбранного транспорта за период'} onClick={onHistory}>{historyActive?'Последняя позиция':'История движения'}</Button>
   {tab==='sensors'&&<Button data-vehicle-period="" tone="outline" data-tooltip="Открыть графики топлива, напряжения и зажигания за выбранный период" onClick={()=>onTelemetry('fuel')}>Показания за период</Button>}
   <Smooth.div className="vehicle-context-actions" ref={actions}>
    <IconButton className="button button-outline icon-button vehicle-location" name="gps" label="Местоположение" data-tooltip="Показать последнее известное положение транспорта" onClick={onLocation}/>
    {(!hasFreshPosition(vehicle)||refreshing)&&<IconButton className="button button-outline icon-button vehicle-refresh" name="refresh" label="Обновить позицию" loading={refreshing} aria-disabled={refreshing||undefined} onClick={()=>{if(!refreshing)onRefresh?.(vehicle);}}/>}
    <Button tone="gray-tertiary" data-tooltip="Открыть заправки и другие топливные транзакции выбранного транспорта за период" onClick={onFuel}>Топливные транзакции</Button>
   </Smooth.div>
  </Smooth.div>
 </>;
}
