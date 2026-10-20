import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import Smooth from '../ui/Smooth';
import {Badge,Button,Empty,Icon,Modal,Search,Segmented} from '../ui';
import Select from '../ui/Select';
import DataTable from '../ui/DataTable';
import {
 assignmentMetrics,biSource,chartPoints,efficiency,efficiencyComparison,filterBiRows,
 fuelOrganizations,fuelRegions,fuelSummary,managerOrganizations,managerSummary,months,number,
} from './bi-data.mjs';
import './bi-reports.css';
import {exportBiRows} from './bi-export';
import {FleetReport,FleetPreviews} from './BiFleetReports';


function MetricTile({label,value,unit,note,trend}:any){
 return <Smooth.article className="bi-metric surface"><p>{label}</p><strong>{number(value)}{unit&&<small>{unit}</small>}</strong><div className="bi-metric-note">{trend&&<Badge tone="success">{trend}</Badge>}<span>{note}</span></div></Smooth.article>;
}

function PreviewLine({active,onMonth}:any){
 const points=chartPoints(months.map(()=>0),660,180,60);
 return <svg viewBox="0 0 660 180" aria-hidden="true" className="bi-preview-line" onClick={e=>e.stopPropagation()} onPointerMove={e=>{const box=e.currentTarget.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*660;onMonth(Math.max(0,Math.min(11,Math.round((x-40)/604*11))));}}>
  {[0,20,40,60].map(v=>{const y=12+(1-v/60)*136;return <g key={v}><line x1="40" x2="644" y1={y} y2={y} className="bi-gridline"/><text x="30" y={y+4} textAnchor="end">{v}%</text></g>})}
  <path d="M40 12V148H644" className="bi-axisline"/>
  <line className="bi-chart-cursor" x1={points[active]?.x} x2={points[active]?.x} y1="12" y2="148"/>
  {efficiency.map((series:any)=><g key={series.id} className={'bi-year-'+series.id}><polyline className="bi-series" points={chartPoints(series.values,660,180,60).filter(Boolean).map((p:any)=>`${p.x},${p.y}`).join(' ')}/>{series.values[active]!==null&&<circle cx={points[active].x} cy={12+(1-series.values[active]/60)*136} r="4" className="bi-chart-dot"/>}</g>)}
  {points.map((p:any,i:number)=><text key={i} x={p.x} y="170" textAnchor={i===0?'start':i===11?'end':'middle'}>{months[i].slice(0,3)}</text>)}
 </svg>;
}

function PreviewFuel(){
 return <div className="bi-preview-bars" aria-hidden="true">{fuelRegions.slice(0,3).map((row:any)=><div key={row.id}><span>{row.name}</span><i style={{width:(row.diesel/4819*100)+'%'}}/><b>{number(row.diesel)}</b></div>)}</div>;
}

function ReportsOverview({onNavigate,onTransactions}:any){
 const [active,setActive]=useState(9),comparison=efficiencyComparison(active);
 return <>
  <header className="bi-intro"><div><h2>Аналитика работы транспорта</h2><p>От общего результата к показателям организаций и регионов.</p></div><Badge>4 отчёта BI</Badge></header>
  <div className="bi-preview-grid">
   <Smooth.button className="bi-preview surface" onClick={()=>onNavigate('reports-manager')} aria-label="Открыть BI Руководитель" onMouseLeave={()=>setActive(9)} onKeyDown={e=>{const next=e.key==='ArrowRight'?Math.min(11,active+1):e.key==='ArrowLeft'?Math.max(0,active-1):null;if(next!==null){e.preventDefault();setActive(next);}}}>
    <div className="bi-preview-heading"><Icon name="chart"/><h3>Руководитель</h3><Icon name="forward"/></div>
    <p>Эффективность наёмного парка, выполнение заданий и рейтинг организаций.</p>
    <div className="bi-preview-values"><div><span>{months[active]} 2026 · коэффициент эффективности</span><strong>{comparison.current===null?'—':number(comparison.current)}<small>%</small></strong></div>{comparison.delta!==null?<Badge tone="success">+{comparison.delta} п. п. к 2025</Badge>:<Badge>За 2026 нет данных</Badge>}</div>
    <PreviewLine active={active} onMonth={setActive}/>
    <footer><span>Месяц · 2026 / 2025: {comparison.current===null?'—':comparison.current+'%'} / {comparison.previous}%</span><span>Открыть отчёт</span></footer>
   </Smooth.button>
   <Smooth.button className="bi-preview surface" onClick={()=>onNavigate('reports-fuel')} aria-label="Открыть BI Топливо">
    <div className="bi-preview-heading"><Icon name="chart"/><h3>Топливо</h3><Icon name="forward"/></div>
    <p>Нормативная потребность в дизельном топливе и бензине по регионам и организациям.</p>
    <div className="bi-preview-values"><div><span>Топливо по нормативам</span><strong>14 935<small>т</small></strong></div><span className="bi-preview-count">23 084 шт. · ТС</span></div>
    <PreviewFuel/>
    <footer><span>ДТ по регионам, т · срез BI</span><span>Открыть отчёт</span></footer>
   </Smooth.button>
   <FleetPreviews onNavigate={onNavigate}/>
  </div>
  <Smooth.section className="bi-transaction-link surface"><Icon name="file"/><div><h3>Топливные транзакции</h3><p>Сводка и детализация по топливной карте и ДУТ для транспорта прототипа.</p></div><Button tone="outline" icon="forward" onClick={onTransactions}>К транзакциям</Button></Smooth.section>
  <p className="bi-source-note">Примеры собраны по присланным экранам BI. Срез BI и демонстрационные транзакции представлены отдельно.</p>
 </>;
}

function ChartLegend({visible,onToggle}:any){
 return <div className="bi-legend" aria-label="Годы на графике">{efficiency.map((s:any)=><button key={s.id} className={'bi-legend-toggle bi-year-'+s.id} type="button" aria-pressed={visible.includes(s.id)} disabled={visible.length===1&&visible.includes(s.id)} data-tooltip={visible.length===1&&visible.includes(s.id)?'На графике должен остаться хотя бы один год':undefined} onClick={()=>onToggle(s.id)}><i/><span>{s.name}</span>{visible.includes(s.id)&&<Icon name="check" size={16}/>}</button>)}</div>;
}

function EfficiencyChart(){
 const [visible,setVisible]=useState(['2026','2025']),[active,setActive]=useState(9),[mode,setMode]=useState('chart');
 const frame=useRef<HTMLDivElement>(null),points=useRef<(HTMLButtonElement|null)[]>([]),[width,setWidth]=useState(720),uid=useId();
 useLayoutEffect(()=>{const el=frame.current;if(!el)return;const measure=()=>setWidth(Math.max(280,Math.floor(el.clientWidth)));const observer=new ResizeObserver(measure);observer.observe(el);measure();return()=>observer.disconnect();},[mode]);
 const toggle=(id:string)=>setVisible(old=>old.includes(id)?old.length===1?old:old.filter(x=>x!==id):[...old,id]);
 const series=efficiency.filter((s:any)=>visible.includes(s.id));
 const values=series.map((s:any)=>({id:s.id,label:s.name,value:s.values[active]}));
 const allPoints=chartPoints(months.map(()=>0),width,260,60);
 const comparison=efficiencyComparison(active);
 return <Smooth.section className="bi-panel surface bi-efficiency" aria-labelledby={uid}>
  <header className="bi-panel-heading"><div><h2 id={uid}>Эффективность по месяцам</h2><p>Наёмный парк · коэффициент эффективности, %</p></div><Segmented value={mode} onChange={setMode} items={[{id:'chart',label:'График'},{id:'table',label:'Таблица'}]}/></header>
  <ChartLegend visible={visible} onToggle={toggle}/>
  {mode==='chart'?<>
   <div className="bi-chart-readout" aria-live="polite"><div><span>{months[active]} · выбранный месяц</span><strong>{values[0].value===null?'Нет данных':number(values[0].value)+'%'}<small>{values[0].label}</small></strong></div>{values.slice(1).map(value=><span key={value.id}>{value.label}: <b>{value.value===null?'Нет данных':number(value.value)+'%'}</b></span>)}{values.length===2&&(comparison.delta!==null?<Badge tone="success">+{comparison.delta} п. п.</Badge>:<Badge>Сравнение недоступно</Badge>)}</div>
   <p className="bi-axis-title">Коэффициент эффективности, %</p>
   <div className="bi-chart-frame" ref={frame} role="group" aria-label="График эффективности. Выберите месяц; стрелки влево и вправо меняют месяц.">
    <svg viewBox={`0 0 ${width} 260`} aria-hidden="true">
     {[0,20,40,60].map(v=>{const y=12+(1-v/60)*216;return <g key={v}><line x1="40" x2={width-16} y1={y} y2={y} className="bi-gridline"/><text x="28" y={y+4} textAnchor="end">{v}</text></g>})}
     <path d={`M40 12V228H${width-16}`} className="bi-axisline"/>
     <line className="bi-chart-cursor" x1={allPoints[active]?.x} x2={allPoints[active]?.x} y1="12" y2="228"/>
     {series.map((s:any)=><g key={s.id} className={'bi-year-'+s.id}><polyline className="bi-series" points={chartPoints(s.values,width,260,60).filter(Boolean).map((p:any)=>`${p.x},${p.y}`).join(' ')}/>{chartPoints(s.values,width,260,60).filter(Boolean).map((p:any)=><circle key={p.index} cx={p.x} cy={p.y} r={p.index===active?5:3} className="bi-chart-dot"/>)}</g>)}
     {allPoints.map((p:any,i:number)=><text key={i} x={p.x} y="252" textAnchor={i===11?'end':i===0?'start':'middle'}>{months[i].slice(0,3)}</text>)}
    </svg>
    {allPoints.map((p:any,i:number)=><button key={i} ref={el=>{points.current[i]=el;}} className="bi-month-hit" type="button" tabIndex={active===i?0:-1} aria-pressed={active===i} aria-label={months[i]+'. '+series.map((s:any)=>s.name+': '+(s.values[i]===null?'нет данных':s.values[i]+'%')).join('; ')} style={{left:(Math.max(0,p.x-(width-56)/22)/width*100)+'%',width:((Math.min(width,p.x+(width-56)/22)-Math.max(0,p.x-(width-56)/22))/width*100)+'%'}} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>setActive(i)} onKeyDown={e=>{const next=e.key==='ArrowRight'?Math.min(11,i+1):e.key==='ArrowLeft'?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?11:null;if(next!==null){e.preventDefault();setActive(next);points.current[next]?.focus();}}}/>) }
   </div>
   <p className="bi-axis-title bi-x-axis-title">Месяц</p>
  </>:<DataTable fitContent rows={months.map((name:string,i:number)=>({id:String(i),month:name,...Object.fromEntries(series.map((s:any)=>[s.id,s.values[i]===null?'—':s.values[i]+'%']))}))} columns={[{key:'month',label:'Месяц',sortable:false},...series.map((s:any)=>({key:s.id,label:s.name,sortable:false}))]} tableLabel="Помесячные значения эффективности"/>}
  <p className="bi-panel-note">На экране BI значения округлены до целых. За ноябрь и декабрь 2026 года значений нет.</p>
 </Smooth.section>;
}

function AssignmentPanel(){
 return <Smooth.section className="bi-panel surface bi-assignment"><header className="bi-panel-heading"><div><h2>Выполнение заданий</h2><p>Показатели исходного среза</p></div><Badge tone="warning">2 ниже цели</Badge></header><dl>{assignmentMetrics.map((metric:any)=><div key={metric.id}><dt>{metric.label}</dt><dd><strong>{number(metric.value)}%</strong><Badge tone={metric.tone==='alert'?'danger':metric.tone}>{metric.status}</Badge></dd><small>{metric.target}</small></div>)}</dl></Smooth.section>;
}

const managerColumns=[
 {key:'name',label:'Организация'},
 {key:'rank',label:'Место',noWrap:true},
 {key:'previous',label:'К эфф. 2025, %',render:(r:any)=>r.previous+'%'},
 {key:'current',label:'К эфф. 2026, %',render:(r:any)=>r.current+'%'},
 {key:'delta',label:'Изменение, п. п.',render:(r:any)=><span className="bi-positive">+{r.delta}</span>},
];

function OrganizationRanking(){
 const [query,setQuery]=useState(''),[organization,setOrganization]=useState(''),[selected,setSelected]=useState<any>(null),heading=useId();
 const rows=filterBiRows(managerOrganizations,query,organization);
 const csvColumns=managerColumns.map(({key,label})=>({key,label}));
 return <Smooth.section className="bi-panel surface bi-ranking" aria-labelledby={heading}>
  <header className="bi-panel-heading"><div><h2 id={heading}>Рейтинг организаций</h2><p>Сравнение за отчётный период текущего и прошлого года</p></div><Button tone="outline" icon="download" disabled={!rows.length} onClick={()=>exportBiRows(rows,csvColumns,'bi-manager-visible.csv')}>Выгрузить</Button></header>
  <div className="bi-table-tools"><Search value={query} onChange={setQuery} label="Поиск организации в рейтинге" placeholder="Найти организацию"/><Select aria-label="Организация в рейтинге" value={organization} onChange={(e:any)=>{setOrganization(e.target.value);setSelected(null);}}><option value="">Все показанные организации</option>{managerOrganizations.map((r:any)=><option key={r.id} value={r.id}>{r.name}</option>)}</Select>{(query||organization)&&<Button tone="text" onClick={()=>{setQuery('');setOrganization('');setSelected(null);}}>Сбросить</Button>}</div>
  {selected&&rows.some((r:any)=>r.id===selected.id)&&<div className="bi-row-inspector" role="status"><div><b>{selected.name}</b><span>Коэффициент эффективности: {selected.previous}% → {selected.current}% · +{selected.delta} п. п.</span></div><Button tone="text" onClick={()=>setSelected(null)}>Свернуть</Button></div>}
  {rows.length?<DataTable rows={rows} measurementRows={managerOrganizations} fitContent columns={managerColumns} initialSort="rank" tableLabel="Рейтинг организаций BI" onSelect={setSelected} selectedId={selected?.id}/>:<Empty text="Организация не найдена" description="Проверьте название или сбросьте поиск по показанным организациям." onReset={()=>{setQuery('');setOrganization('');}}/>}
  <p className="bi-panel-note">Показаны {rows.length} из {managerOrganizations.length} строк, видимых на исходном экране. Полный рейтинг и его период фильтра не предоставлены.</p>
 </Smooth.section>;
}

function ManagerReport({onNavigate}:any){
 return <><div className="bi-metric-grid manager"><MetricTile label="Среднегодовой К эфф. · 2026" value={managerSummary.currentEfficiency} unit="%" trend="+6 п. п." note="36% за 2025 год"/><MetricTile label="Интегральный показатель" value={managerSummary.score} unit="баллов" note="Цель — 8,5; без верхнего оборудования — 5,5"/><MetricTile label="ТС наёмного парка" value={managerSummary.vehicles} unit="шт." note="По заданиям в исходном срезе"/></div><div className="bi-manager-grid"><EfficiencyChart/><AssignmentPanel/></div><OrganizationRanking/><Smooth.section className="bi-panel surface bi-report-next"><div><h2>От общего результата к работе парка</h2><p>В отчётах по парку — сравнение организаций и показатели оформления заданий и путевых листов.</p></div><Button tone="outline" onClick={()=>onNavigate('reports-hired')}>Наёмный парк</Button><Button tone="outline" onClick={()=>onNavigate('reports-owned')}>Собственный парк</Button></Smooth.section></>;
}

function FuelBars({rows,selected,onSelect,measure}:any){
 const max=Math.max(...rows.map((r:any)=>r[measure==='all'?'diesel':measure]+(measure==='all'?r.petrol:0)),1);
 return <div className="bi-ranked-bars" aria-label="Сравнение нормативной потребности">{rows.map((r:any)=>{
  const diesel=measure==='petrol'?0:r.diesel,petrol=measure==='diesel'?0:r.petrol;
  return <button type="button" className="bi-bar-row" key={r.id} aria-pressed={selected===r.id} aria-label={r.name+': ДТ '+number(r.diesel)+' т, бензин '+number(r.petrol)+' т. Открыть данные.'} onClick={()=>onSelect(selected===r.id?'':r.id)}><span className="bi-bar-label">{r.name}</span><span className="bi-bar-track"><i className="bi-diesel" style={{width:diesel/max*100+'%'}}/><i className="bi-petrol" style={{width:petrol/max*100+'%'}}/></span><strong>{number(diesel+petrol)}<small>т</small></strong><Icon name="forward" size={20}/></button>;
 })}</div>;
}

const fuelBaseColumns=[{key:'name',label:'Название'},{key:'vehicles',label:'ТС по заданиям, шт.',render:(r:any)=>number(r.vehicles)},{key:'diesel',label:'ДТ, т',render:(r:any)=>number(r.diesel)},{key:'petrol',label:'Бензин, т',render:(r:any)=>number(r.petrol)}];

function FuelReport(){
 const [dimension,setDimension]=useState('regions'),[measure,setMeasure]=useState('all'),[selected,setSelected]=useState(''),[query,setQuery]=useState('');
 const comparison=useRef<HTMLElement>(null),details=useRef<HTMLElement>(null);
 function chooseCategory(id:string){setSelected(id);if(id)requestAnimationFrame(()=>{details.current?.scrollIntoView({block:'start',behavior:'auto'});details.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});});}
 function backToComparison(){setSelected('');comparison.current?.scrollIntoView({block:'start',behavior:'auto'});comparison.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});}
 const source=dimension==='regions'?fuelRegions:fuelOrganizations;
 const chartRows=filterBiRows(source,query),rows=filterBiRows(source,query,selected),detail=source.find((r:any)=>r.id===selected);
 const columns=[{...fuelBaseColumns[0],label:dimension==='regions'?'Регион':'Организация'},...fuelBaseColumns.slice(1),...(dimension==='organizations'?[{key:'dieselMileage',label:'ДТ на пробег, т',render:(r:any)=>number(r.dieselMileage)},{key:'dieselEquipment',label:'ДТ на ВО, т',render:(r:any)=>number(r.dieselEquipment)}]:[])];
 function changeDimension(value:string){setDimension(value);setSelected('');setQuery('');}
 return <>
  <div className="bi-metric-grid fuel"><MetricTile label="Нормативная потребность" value={fuelSummary.tonnes} unit="т" note="ДТ и бензин · полный срез BI"/><MetricTile label="Уникальные ТС" value={fuelSummary.vehicles} unit="шт." note="По заданиям · полный срез BI"/><MetricTile label="Дизельное топливо" value={fuelSummary.diesel} unit="т" note="Пробег и верхнее оборудование"/><MetricTile label="Бензин" value={fuelSummary.petrol} unit="т" note="Потребность по нормативам"/></div>
  <Smooth.section className="bi-panel surface bi-fuel-composition"><header className="bi-panel-heading"><div><h2>Структура потребности</h2><p>Доли рассчитаны от полного итога {number(fuelSummary.tonnes)} т</p></div></header><div className="bi-composition-track" role="img" aria-label={'Дизельное топливо '+number(fuelSummary.diesel/fuelSummary.tonnes*100)+'%, бензин '+number(fuelSummary.petrol/fuelSummary.tonnes*100)+'%'}><i className="bi-diesel" style={{width:fuelSummary.diesel/fuelSummary.tonnes*100+'%'}}/><i className="bi-petrol" style={{width:fuelSummary.petrol/fuelSummary.tonnes*100+'%'}}/></div><dl className="bi-composition-values"><div><dt><i className="bi-diesel"/>Дизельное топливо</dt><dd>{number(fuelSummary.diesel/fuelSummary.tonnes*100)}%<small>{number(fuelSummary.diesel)} т</small></dd></div><div><dt><i className="bi-petrol"/>Бензин</dt><dd>{number(fuelSummary.petrol/fuelSummary.tonnes*100)}%<small>{number(fuelSummary.petrol)} т</small></dd></div></dl></Smooth.section>
  <Smooth.section ref={comparison} className="bi-panel surface bi-fuel-analysis">
   <header className="bi-panel-heading"><div><h2 tabIndex={-1}>Потребность в топливе</h2><p>Сравните показанные категории и выберите строку для подробностей.</p></div><Segmented value={dimension} onChange={changeDimension} items={[{id:'regions',label:'Регионы'},{id:'organizations',label:'Организации'}]}/></header>
   <div className="bi-table-tools"><Search value={query} label={dimension==='regions'?'Поиск региона BI':'Поиск организации в топливе'} placeholder={dimension==='regions'?'Найти регион':'Найти организацию'} onChange={(v:string)=>{setQuery(v);setSelected('');}}/><Select aria-label="Вид топлива на диаграмме" value={measure} onChange={(e:any)=>setMeasure(e.target.value)}><option value="all">ДТ и бензин</option><option value="diesel">Дизельное топливо</option><option value="petrol">Бензин</option></Select>{(query||selected)&&<Button tone="text" onClick={()=>{setQuery('');setSelected('');}}>Сбросить</Button>}</div>
   {chartRows.length?<><div className="bi-fuel-legend" aria-label="Обозначения топлива">{measure!=='petrol'&&<span><i className="bi-diesel"/>Дизельное топливо</span>}{measure!=='diesel'&&<span><i className="bi-petrol"/>Бензин</span>}<span>Нормативная потребность, т</span></div><FuelBars rows={chartRows} selected={selected} onSelect={chooseCategory} measure={measure}/></>:<Empty text={dimension==='regions'?'Регион не найден':'Организация не найдена'} description="В примере доступны только строки, видимые на присланном экране BI." onReset={()=>setQuery('')}/>}
   <p className="bi-panel-note">Диаграмма показывает {chartRows.length} из {source.length} доступных строк. Это часть сводки; её сумма не заменяет полный итог BI.</p>
  </Smooth.section>
  <Smooth.section ref={details} className="bi-panel surface bi-fuel-table">
   <header className="bi-panel-heading"><div><h2 tabIndex={-1}>{detail?detail.name:dimension==='regions'?'Данные по регионам':'Данные по организациям'}</h2><p>{detail?'Выбранная категория из сводки':'Значения с исходного экрана BI'}</p></div><div className="bi-panel-actions">{selected&&<Button tone="text" onClick={backToComparison}>К сравнению</Button>}<Button tone="outline" icon="download" disabled={!rows.length} onClick={()=>exportBiRows(rows,columns.map(({key,label})=>({key,label})),'bi-fuel-'+dimension+'-visible.csv')}>Выгрузить</Button></div></header>
   {detail&&<div className="bi-selected-summary" role="status"><span>ТС по заданиям <b>{number(detail.vehicles)} шт.</b></span><span>ДТ <b>{number(detail.diesel)} т</b></span><span>Бензин <b>{number(detail.petrol)} т</b></span></div>}
   {rows.length?<DataTable key={dimension} fitContent rows={rows} measurementRows={source} columns={columns} initialSort="diesel" tableLabel={dimension==='regions'?'Топливо по регионам BI':'Топливо по организациям BI'} onSelect={selected?undefined:(r:any)=>chooseCategory(r.id)} selectedId={selected}/>:<p className="bi-panel-note">Нет строк по текущему поиску.</p>}
   <p className="bi-panel-note">ВО — верхнее оборудование. Значения округлены в исходном BI; сумма составляющих может отличаться от опубликованного итога. Рублёвые показатели не предоставлены.</p>
  </Smooth.section>
 </>;
}

export default function BiReports({page,onNavigate,onTransactions}:any){
 const [sourceOpen,setSourceOpen]=useState(false),root=useRef<HTMLDivElement>(null);
 useEffect(()=>{root.current?.scrollTo({top:0});root.current?.closest('.app-shell')?.querySelector<HTMLElement>('.app-header h1')?.focus({preventScroll:true});},[page]);
 const overview=page==='reports-overview';
 return <div className="bi-workspace" ref={root} role="region" aria-label="Содержимое отчёта BI" tabIndex={0}>
  <Smooth.header className="bi-toolbar surface"><div>{!overview&&<Button tone="text" icon="back" onClick={()=>onNavigate('reports-overview')}>К отчётам</Button>}<span className="bi-snapshot"><Icon name="chart" size={20}/>Срез BI · демонстрация</span></div><Button tone="text" icon="info" onClick={()=>setSourceOpen(true)}>О данных</Button></Smooth.header>
  {overview?<ReportsOverview onNavigate={onNavigate} onTransactions={onTransactions}/>:page==='reports-manager'?<ManagerReport onNavigate={onNavigate}/>:page==='reports-fuel'?<FuelReport/>:<FleetReport key={page} kind={page==='reports-hired'?'hired':'owned'}/>}
  {sourceOpen&&<Modal title="О данных BI" onClose={()=>setSourceOpen(false)} footer={<Button tone="gray-tertiary" onClick={()=>setSourceOpen(false)}>Закрыть</Button>}><p>Основа примеров — экраны модуля гибкой отчётности ЕКТП, полученные {biSource.received}.</p><dl className="bi-source-details"><dt>Руководитель</dt><dd>{biSource.manager}</dd><dt>Топливо</dt><dd>{biSource.fuel}</dd><dt>Наёмный парк</dt><dd>{biSource.hired}</dd><dt>Собственный парк</dt><dd>{biSource.owned}</dd><dt>Период и дата выгрузки</dt><dd>Точные значения фильтров на скриншотах не показаны.</dd></dl><p>Показатели перенесены с экранов. В таблицах доступна только видимая часть строк. Исходные записи и полная методика расчёта не предоставлены; произвольный период не пересчитывается.</p><p>BI-итоги не связаны с демонстрационными транспортом и транзакциями прототипа. Стоимости и скрытые значения не восстанавливались.</p></Modal>}
 </div>;
}
