import {useId,useRef,useState} from 'react';
import Smooth from '../ui/Smooth';
import {Badge,Button,Empty,Icon,Search,Segmented} from '../ui';
import DataTable from '../ui/DataTable';
import {exportBiRows} from './bi-export';
import {filterBiRows,hiredOrganizations,hiredSummary,number,ownedMetrics,ownedOrganizations,ownedSummary} from './bi-data.mjs';

const percent=(value:any)=>value===null?'—':number(value)+'%';
function FleetMetric({label,value,unit,note}:any){
 return <Smooth.article className="bi-metric surface"><p>{label}</p><strong>{number(value)}<small>{unit}</small></strong><div className="bi-metric-note">{note}</div></Smooth.article>;
}
export function FleetPreviews({onNavigate}:any){
 return <>{[
  {id:'hired',name:'Наёмный парк',description:'Сравнение эффективности организаций за три года и контроль выполнения заданий.',value:hiredSummary.assignedVehicles,note:'ТС по заданиям',footer:'7 организаций · сравнение 2024–2026'},
  {id:'owned',name:'Собственный парк',description:'Использование парка, оформление заданий и путевых листов, отклонения от целей.',value:ownedSummary.vehicles,note:'ТС в исходном срезе',footer:'4 организации · показатели и цели'},
 ].map(item=><Smooth.button key={item.id} className="bi-preview bi-fleet-preview surface" aria-label={'Открыть BI '+item.name} onClick={()=>onNavigate('reports-'+item.id)}><div className="bi-preview-heading"><Icon name="bus"/><h3>{item.name}</h3><Icon name="forward"/></div><p>{item.description}</p><div className="bi-preview-values"><div><span>{item.note}</span><strong>{number(item.value)}<small>шт.</small></strong></div></div><div className="bi-fleet-preview-values">{(item.id==='hired'?[{label:'2024',value:hiredSummary.y2024},{label:'2025',value:hiredSummary.previous},{label:'2026',value:hiredSummary.current}]:[{label:'Эксплуатация',value:ownedMetrics[0].value},{label:'Оформление заданий',value:ownedMetrics[1].value},{label:'Оформление ПЛ',value:ownedMetrics[3].value}]).map(metric=><div key={metric.label}><span>{metric.label}</span><b>{metric.value}%</b></div>)}</div><footer><span>{item.footer}</span><span>Открыть отчёт</span></footer></Smooth.button>)}</>;
}

const hiredPerformance=[{key:'name',label:'Организация'},{key:'vehicles',label:'ТС, шт.',render:(r:any)=>number(r.vehicles)},{key:'y2024',label:'2024, %',render:(r:any)=>percent(r.y2024)},{key:'y2025',label:'2025, %',render:(r:any)=>percent(r.y2025)},{key:'y2026',label:'2026, %',render:(r:any)=>percent(r.y2026)},{key:'score',label:'Показатель, баллы',render:(r:any)=>number(r.score)}];
const hiredQuality=[{key:'name',label:'Организация'},{key:'assigned',label:'Назначенные ТС, %',render:(r:any)=>percent(r.assigned)},{key:'completed',label:'Завершённые задания, %',render:(r:any)=>percent(r.completed)},{key:'mileage',label:'Отклонение пробега, %',render:(r:any)=>percent(r.mileage)},{key:'equipment',label:'Отклонение ВО, %',render:(r:any)=>percent(r.equipment)}];
const ownedUsage=[{key:'name',label:'Организация'},{key:'vehicles',label:'Всего ТС, шт.',render:(r:any)=>number(r.vehicles)},{key:'assigned',label:'ТС по заданиям, шт.',render:(r:any)=>number(r.assigned)},{key:'usage',label:'Эксплуатация, %',render:(r:any)=>percent(r.usage)},{key:'tasks',label:'Оформление заданий, %',render:(r:any)=>percent(r.tasks)},{key:'closed',label:'Закрытие заданий, %',render:(r:any)=>percent(r.closed)}];
const ownedDocuments=[{key:'name',label:'Организация'},{key:'waybills',label:'Оформление ПЛ, %',render:(r:any)=>percent(r.waybills)},{key:'closedWaybills',label:'Закрытие ПЛ, %',render:(r:any)=>percent(r.closedWaybills)},{key:'mileage',label:'Отклонение пробега, %',render:(r:any)=>percent(r.mileage)},{key:'movement',label:'Отклонение времени, %',render:(r:any)=>percent(r.movement)},{key:'hours',label:'Движение БСМТС, ч',render:(r:any)=>r.hours===null?'—':number(r.hours)}];

function YearComparison({rows,selected,onSelect}:any){
 const [years,setYears]=useState(['2024','2025','2026']);
 return <>
  <div className="bi-legend" aria-label="Годы сравнения парка">{['2024','2025','2026'].map(year=><button type="button" key={year} className={'bi-legend-toggle bi-year-'+year} aria-pressed={years.includes(year)} disabled={years.length===1&&years.includes(year)} onClick={()=>setYears(old=>old.includes(year)?old.length===1?old:old.filter(y=>y!==year):[...old,year])}><i/><span>{year}</span>{years.includes(year)&&<Icon name="check" size={16}/>}</button>)}</div>
  <div className="bi-comparison-axis"><span>Коэффициент эффективности, %</span><div>{[0,25,50,75,100].map(t=><span key={t}>{t}</span>)}</div></div>
  <div className="bi-fleet-comparison">{rows.map((row:any)=><button className="bi-fleet-comparison-row" type="button" key={row.id} aria-pressed={selected===row.id} aria-label={row.name+'. '+years.map(year=>year+': '+row['y'+year]+'%').join('; ')+'. Открыть сравнение.'} onClick={()=>onSelect(selected===row.id?'':row.id)}><span>{row.name}</span><span className="bi-fleet-tracks">{years.map(year=><span key={year} className={'bi-year-'+year}><i style={{width:row['y'+year]+'%'}}/><b>{row['y'+year]}%</b><small>{year}</small></span>)}</span></button>)}</div>
 </>;
}

function OwnGoals(){
 return <Smooth.section className="bi-panel surface"><header className="bi-panel-heading"><div><h2>Показатели и цели</h2><p>Фактические значения исходного среза и заданные в нём ориентиры</p></div></header><dl className="bi-goal-grid">{ownedMetrics.map((metric:any)=>{
  const unknown=metric.rule==='unknown',ok=metric.rule==='above'?metric.value>metric.target:Math.abs(metric.value)<=metric.target;
  return <div key={metric.id}><dt>{metric.label}</dt><dd><strong>{percent(metric.value)}</strong><Badge tone={unknown?undefined:ok?'success':'danger'}>{unknown?'Уточнить цель':ok?'В пределах цели':'Вне цели'}</Badge></dd><small>{metric.goal}</small></div>;
 })}</dl><details className="bi-method"><summary>Особенности исходных показателей</summary><p>Отклонение пробега −5 426% перенесено с исходного экрана без исправления. Для закрытия путевых листов там указаны две разные цели: выше 80% в карточке и от 95 до 105% в таблице. До уточнения методики статус этого показателя не рассчитывается.</p><p>БСМТС — обозначение системы в источнике; ПЛ — путевой лист. Время в движении — 0,2 ч на одно ТС за день, целевое значение в источнике — 4,4 ч. Отклонение по времени — 15%; формула показателя не предоставлена.</p></details></Smooth.section>;
}

export function FleetReport({kind}:any){
 const owned=kind==='owned',source=owned?ownedOrganizations:hiredOrganizations;
 const [query,setQuery]=useState(''),[mode,setMode]=useState(owned?'usage':'efficiency'),[selected,setSelected]=useState('');
 const rows=filterBiRows(source,query),detail=rows.find((row:any)=>row.id===selected),uid=useId(),inspector=useRef<HTMLDivElement>(null);
 const columns=owned?(mode==='usage'?ownedUsage:ownedDocuments):(mode==='efficiency'?hiredPerformance:hiredQuality);
 function choose(id:string){setSelected(id);if(id)requestAnimationFrame(()=>{inspector.current?.scrollIntoView({block:'nearest',behavior:'auto'});inspector.current?.querySelector<HTMLElement>('h3')?.focus({preventScroll:true});});}
 return <>
  <div className="bi-metric-grid fuel">{owned?<>
   <FleetMetric label="ТС в исходном срезе" value={ownedSummary.vehicles} unit="шт." note="С учётом исключений исходного BI"/><FleetMetric label="ТС в эксплуатации" value={ownedSummary.operating} unit="шт." note="Отдельный показатель исходного среза"/><FleetMetric label="ТС по заданиям" value={ownedSummary.assigned} unit="шт." note="Количество из сводки BI"/><FleetMetric label="Интегральный показатель" value={ownedSummary.score} unit="балла" note="Максимум — 7,5 балла"/>
  </>:<>
   <FleetMetric label="ТС по заданиям" value={hiredSummary.assignedVehicles} unit="шт." note="Показатель карточки исходного BI"/><FleetMetric label="ТС по заказчикам" value={hiredSummary.customerVehicles} unit="шт." note="ТС с несколькими заказчиками учтено повторно"/><FleetMetric label="Эффективность · 2026" value={hiredSummary.current} unit="%" note="37% за 2025 год в этом срезе"/><FleetMetric label="Интегральный показатель" value={hiredSummary.score} unit="баллов" note="Максимум — 8,5; без ВО — 5,5"/>
  </>}</div>
  {owned&&<OwnGoals/>}
  <Smooth.section className="bi-panel surface bi-fleet-report" aria-labelledby={uid}>
   <header className="bi-panel-heading"><div><h2 id={uid}>Сравнение организаций</h2><p>{owned?'Использование парка и оформление документов':'Динамика эффективности и выполнение заданий'}</p></div><Button tone="outline" icon="download" disabled={!rows.length} onClick={()=>exportBiRows(rows,columns,'bi-'+kind+'-visible.csv')}>Выгрузить</Button></header>
   <div className="bi-table-tools"><Search value={query} onChange={(v:string)=>{setQuery(v);setSelected('');}} label={owned?'Поиск организации собственного парка':'Поиск организации наёмного парка'} placeholder="Найти организацию"/>{query&&<Button tone="text" onClick={()=>{setQuery('');setSelected('');}}>Сбросить</Button>}<Segmented value={mode} onChange={setMode} items={owned?[{id:'usage',label:'Использование парка'},{id:'documents',label:'Документы и отклонения'}]:[{id:'efficiency',label:'Эффективность'},{id:'quality',label:'Выполнение заданий'}]}/></div>
   {rows.length?<>
    {!owned&&mode==='efficiency'&&<YearComparison rows={rows} selected={selected} onSelect={choose}/>}
    {detail&&<div className="bi-fleet-detail" ref={inspector} role="status"><header><h3 tabIndex={-1}>{detail.name}</h3><Button tone="text" onClick={()=>setSelected('')}>Свернуть</Button></header><dl>{columns.filter((col:any)=>col.key!=='name').map((col:any)=><div key={col.key}><dt>{col.label}</dt><dd>{col.render?col.render(detail):detail[col.key]}</dd></div>)}</dl></div>}
    <DataTable key={mode} fitContent rows={rows} measurementRows={source} columns={columns} initialSort="name" tableLabel={owned?'Организации собственного парка BI':'Организации наёмного парка BI'} onSelect={(row:any)=>choose(selected===row.id?'':row.id)} selectedId={selected}/>
   </>:<Empty text="Организация не найдена" description="Доступны только строки, видимые на исходном экране." onReset={()=>setQuery('')}/>}
   <p className="bi-panel-note">Показано {rows.length} из {source.length} перенесённых организаций. Их сумма не заменяет полный итог. {owned?'Прочерк означает N/A в источнике; обрезанные значения не восстанавливались.':'Этот экран — отдельный исходный срез: его значения не объединяются со сводкой «Руководитель». ВО — верхнее оборудование.'}</p>
   <details className="bi-method"><summary>Как читать показатели</summary><p>{owned?'Оформление и закрытие заданий и путевых листов показаны как отдельные коэффициенты. Их знаменатели в материалах не раскрыты; количество документов по процентам не восстанавливается.':'В сравнении используются три отдельных годовых значения коэффициента эффективности, а во вкладке заданий — назначение ТС, завершение заданий и отклонения пробега и верхнего оборудования. Изменение между годами измеряется в процентных пунктах.'}</p><p>Поиск, сортировка и выгрузка работают с доступными строками. Точный период фильтра, исходные записи и полный перечень организаций не предоставлены.</p></details>
  </Smooth.section>
 </>;
}
