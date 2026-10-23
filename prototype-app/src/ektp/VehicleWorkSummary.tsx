import {workRouteProgress,hasFreshPosition} from './vehicle-motion.mjs';
import documents from '../data/ektp-sections.json';
import {tripRoutes} from './trip-routes.mjs';

export default function VehicleWorkSummary({vehicle,seconds=0}:any){
 const task=documents.tasks.find(t=>t.vehicleId===vehicle.id),request=task&&documents.requests.find(r=>r.id===task.requestId);
 const parked=vehicle.demoScenario==='base',convoy=vehicle.demoScenario==='convoy',trip=tripRoutes.get(vehicle.id),fresh=hasFreshPosition(vehicle);
 const done=!!request&&['Завершена','Завершено','Закрыта'].includes(request.status);
 const active=convoy||(!parked&&(!request||request.status==='В работе'));
 const progress=done?1:active?workRouteProgress(vehicle,seconds):null;
 const title=task?.description||(parked?'Стоянка на базе':convoy?'Перегон автоколонны':trip?'Демонстрационный рейс':'Текущая работа не указана');
 const route=task?.route||(parked?'Площадка в Поливанове':convoy?'М-2 · кольцевой маршрут':trip?'Участок маршрута · '+vehicle.city:'Маршрут не указан');
 const phase=parked?'На базе':done?'Завершено':!fresh?'Нет актуальной позиции':active?'В пути':'Назначено';
 const current=parked?0:done?2:!fresh?null:active?1:0;
 const steps=parked?['На базе','Выезд','В пути']:['Назначено','В пути','Завершено'];
 return <section className="vehicle-work" aria-label="Текущая работа">
  <div className="vehicle-work-main"><span>Текущая работа{task?' · '+task.number:''}</span><strong>{title}</strong></div>
  <div className="vehicle-work-route"><div><span>Маршрут</span><small>{progress===null?(parked?'Стоянка':phase):Math.round(progress*100)+'%'}</small></div><p>{route}</p>{!parked&&(trip||convoy||task)&&<div className="vehicle-work-progress" role="progressbar" aria-label="Прогресс демонстрационного маршрута" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress===null?undefined:Math.round(progress*100)} aria-valuetext={progress===null?'Прогресс не получен':Math.round(progress*100)+'%'}><i style={{width:progress===null?'0%':(progress*100)+'%'}}/></div>}</div>
  <ol className="vehicle-work-steps" aria-label="Этапы работы">{steps.map((label,i)=><li key={label} data-complete={current!==null&&i<current} aria-current={i===current?'step':undefined}><i aria-hidden="true"/><span>{label}</span></li>)}</ol>
 </section>;
}
