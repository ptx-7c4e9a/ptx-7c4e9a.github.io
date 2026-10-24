import {vehicleMotionLabel,hasFreshPosition} from './vehicle-motion.mjs';
import {StatusBadge} from '../ui';
import Smooth from '../ui/Smooth';
import {Button,IconButton,DetailRow,Tabs,Empty} from '../ui';
import {transportImage} from '../ui/Transport';
import {vehicleTypeLabel,fleetOwnership,fleetOwnershipLabel} from './map-vehicle-state.mjs';
import history from '../data/ektp-history.json';
import {demoStatistics} from './demo-records.mjs';
import {preparedHistoryRange} from './history-availability.mjs';
import {tripRoutes} from './trip-routes.mjs';
import PeriodControl from '../ui/PeriodControl';
import useMapReadings from './useMapReadings';
import VehicleSnapshot from './VehicleSnapshot';
import VehicleWorkSummary from './VehicleWorkSummary';
import {formatPeriodButton} from '../logic.mjs';

const sensorLabels:Record<string,string>={rpm:'Обороты двигателя',coolant:'Температура ОЖ, °C',battery:'Напряжение, В',pressure:'Давление, бар',ignition:'Зажигание',can:'CAN',gps:'GPS'};
const statisticLabels:Record<string,string>={distanceKm:'Пробег, км',movingHours:'В движении, ч',averageSpeedKmh:'Средняя скорость, км/ч',maximumSpeedKmh:'Максимальная скорость, км/ч'};

export default function VehicleCard({vehicle,theme,mapContext=false,unified=false,tab,onTab,onTelemetry,onHistory,onFuel,onPeriod,onResetPeriod,range=preparedHistoryRange,historyActive=false,onLocation,onRefresh,refreshing=false,onActions,actionsOpen=false}:any){
 const readings=useMapReadings(vehicle),number=(value:any)=>typeof value==='number'?value.toLocaleString('ru-RU',{maximumFractionDigits:1}):'—';
 const statistics=demoStatistics(vehicle,range,history.historicalExample);
 const trip=tripRoutes.get(vehicle.id);
 return <>
  {mapContext?<h3 className="vehicle-inspector-type" tabIndex={-1}>{vehicleTypeLabel(vehicle)}</h3>:<Smooth.img className="vehicle-hero" src={transportImage(vehicle,'card',theme)} alt={vehicle.model}/> }
  {mapContext&&unified&&<div className="vehicle-card-identity"><strong>{vehicle.plate}</strong><span className="map-fleet-badge" data-fleet={fleetOwnership(vehicle)}>{fleetOwnershipLabel(vehicle)}</span></div>}
  {unified&&<Tabs value={tab} onChange={onTab} items={[{id:'info',label:'Информация'},{id:'stats',label:'Статистика'},{id:'sensors',label:'Датчики'}]}/>}
  <Smooth.div className="scroll-content">
  {mapContext&&unified&&tab==='info'&&<VehicleSnapshot vehicle={vehicle} theme={theme} readings={readings}/> }
  {mapContext&&(!unified||tab==='info')&&<VehicleWorkSummary vehicle={vehicle} seconds={readings.elapsedSeconds}/>}
  {!unified&&<Tabs value={tab} onChange={onTab} items={[{id:'info',label:'Информация'},{id:'stats',label:'Статистика'},{id:'sensors',label:'Датчики'}]}/>}
   {tab==='info'&&mapContext?<div className="vehicle-passport">{[
    {title:'Сведения о ТС',rows:[...(!unified?[['Модель',vehicle.model]]:[]),...(vehicle.year?[['Год выпуска',vehicle.year]]:[])]},
    {title:'Организация',rows:[['Владелец',vehicle.ownerName],['Город',vehicle.city]]},
    {title:'Подключение',rows:[...(vehicle.tracker?[['Терминал',vehicle.tracker]]:[]),...(!unified?[['Состояние',<StatusBadge value={vehicleMotionLabel(vehicle)}/>]]:[]),['Последний сигнал',vehicle.demoScenario?'Демонстрационные данные':vehicle.signal||'Нет данных']]},
    ...(trip?[{title:'Текущий рейс',rows:[['Длина маршрута',trip.distanceKm.toLocaleString('ru-RU',{maximumFractionDigits:0})+' км']]}]:[])
   ].filter(section=>section.rows.length).map(section=><section key={section.title} aria-label={section.title}>{section.title!=='Сведения о ТС'&&<h4>{section.title}</h4>}<dl>{section.rows.map(([label,value]:any)=><DetailRow key={label} label={label}>{value}</DetailRow>)}</dl></section>)}</div>
   :tab==='info'?<dl>{[['Модель',vehicle.model],['Принадлежность',vehicle.kind],['Владелец',vehicle.ownerName],['Город',vehicle.city],['Год выпуска',vehicle.year||'—'],['Терминал',vehicle.tracker||'—'],['Маршрут рейса',trip?trip.distanceKm.toLocaleString('ru-RU',{maximumFractionDigits:0})+' км':'—'],['Состояние',<StatusBadge value={vehicleMotionLabel(vehicle)}/>],['Скорость',readings.fresh?vehicle.speed+' км/ч':'—'],[readings.fuelLabel,number(readings.fuel)+(readings.fuel===null?'':' '+readings.fuelUnit)],['Напряжение',number(readings.voltage)+(readings.voltage===null?'':' В')],['Данные',readings.replay?'Демо · '+readings.clock+' · ×60':vehicle.signal||'—']].map(([label,value]:any)=><DetailRow key={label} label={label}>{value}</DetailRow>)}</dl>
   :tab==='stats'?<>
    <PeriodControl className="vehicle-period-control" label={"Период: "+formatPeriodButton(range)} onClick={onPeriod} onReset={onResetPeriod}/>
    {statistics?<Smooth.div className="telemetry-grid">{Object.entries(statistics).map(([key,value]:any)=><Smooth.div className="telemetry-cell" key={key}><small>{statisticLabels[key]||key}</small><strong>{typeof value==='number'?value.toLocaleString('ru-RU',{maximumFractionDigits:1}):value}</strong></Smooth.div>)}</Smooth.div>:<Empty text="За этот период данных нет" description="Измените период, чтобы посмотреть статистику транспорта."/>}
   </>:<>
    <h3 className="sensor-snapshot-title">Последние показания</h3>
    <p className="sensor-snapshot-time">Последний сигнал: {vehicle.signal||'нет данных'}</p>
    {vehicle.sensors?<Smooth.div className="telemetry-grid">{Object.entries(vehicle.sensors).map(([key,value]:any)=><Smooth.div className="telemetry-cell" key={key}><small>{sensorLabels[key]||key}</small><strong>{typeof value==='boolean'?<StatusBadge value={value?'Есть':'Нет'}/>:typeof value==='number'?number(value):String(value)}</strong></Smooth.div>)}</Smooth.div>:<Empty text="Последние показания не получены" description="Проверьте историю датчиков через «История показаний»."/>}
   </>}
  </Smooth.div>
  {!hasFreshPosition(vehicle)&&<Button icon="refresh" tone="outline" disabled={refreshing} onClick={()=>onRefresh?.(vehicle)}>{refreshing?'Обновляем данные':'Обновить данные'}</Button>}
  <Smooth.div className="vehicle-action-group">
   <Button icon="route" tone="primary" data-tooltip={historyActive?'Вернуться к последнему известному положению транспорта':'Показать маршрут и воспроизвести движение выбранного транспорта за период'} onClick={onHistory}>{historyActive?'Последняя позиция':'История движения'}</Button>
   {tab==='sensors'&&<Button data-vehicle-period="" tone="outline" data-tooltip="Открыть графики топлива, напряжения и зажигания с выбором периода" onClick={()=>onTelemetry('fuel')}>История показаний</Button>}
   <Smooth.div className="vehicle-context-actions">
    {unified?<IconButton className="button button-outline icon-button vehicle-actions-trigger" name="dots-vertical" iconSize={20} label="Действия с ТС" aria-haspopup="menu" aria-expanded={actionsOpen} onClick={onActions}/>:<IconButton className="button button-outline icon-button vehicle-location" name="gps" iconSize={20} label="Местоположение ТС" onClick={onLocation}/>}

    <Button disabled={!!vehicle.demoScenario} tone="outline" data-tooltip="Открыть заправки и другие топливные транзакции выбранного транспорта за период" onClick={onFuel}>Топливные транзакции</Button>
   </Smooth.div>
  </Smooth.div>

 </>;
}
