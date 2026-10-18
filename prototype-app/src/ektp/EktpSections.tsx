import {StatusBadge} from '../ui';
import {useEffect,useRef,useState} from 'react';
import Smooth from '../ui/Smooth';
import {Badge,Button,DetailRow,Empty,Field,Modal,Search,Segmented,Tabs,date} from '../ui';
import Select from '../ui/Select';
import DateTimeField,{DateTimeGroup} from '../ui/DateTimeField';
import DataTable from '../ui/DataTable';
import useDemoWorkflow from '../ui/useDemoWorkflow';
import BatchActions from '../ui/BatchActions';
import fixture from '../data/ektp-sections.json';
import fleet from '../data/ektp.json' with {type:'json'};
import VehicleCard from './VehicleCard';
import TelemetryPanel from './TelemetryPanel';
import {historyAvailability} from './history-availability.mjs';
import {matchingRecords} from './section-records.mjs';

const defaultDates={from:'2026-10-12',to:'2026-10-13'};
const organization=(id:string)=>fixture.organizations.find(o=>o.id===id)?.name||'—';
const vehicle=(id:string)=>fleet.fleet.find(v=>v.id===id);
const department=(id:string)=>fixture.departments.find(d=>d.id===id)?.name||'—';
const vehicleName=(id:string)=>vehicle(id)?.plate||'Не назначено';
const titles={requests:'Заявки',waybills:'Путевые листы',catalogs:'Справочники'};

function Registry({kind,onOpen,active}:any){
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[catalog,setCatalog]=useState('contractors');
 const [dates,setDates]=useState(defaultDates),[draft,setDraft]=useState(defaultDates),[period,setPeriod]=useState(false),[error,setError]=useState('');
 const isRequest=kind==='requests',isWaybill=kind==='waybills',isDirectory=kind==='catalogs';
 const rows=isRequest?fixture.requests:isWaybill?fixture.waybills.map(w=>({...w,plate:vehicleName(w.vehicleId),operator:organization(w.operatorOrgId)})):catalog==='contractors'?fixture.contractors:fixture.departments.map(d=>({...d,organization:organization(d.orgId)}));
 const workflow=useDemoWorkflow('ektp-'+kind,rows,!isDirectory);
 const filtered=matchingRecords((workflow.deferredTab?workflow.deferred:workflow.active),{query,fields:isRequest?['number','description']:isWaybill?['number','plate','driver']:catalog==='contractors'?['name','inn']:['name'],category,categoryKey:isRequest?'status':'form',dates:isDirectory?null:dates,dateMode:isRequest?'created':'interval'});
 useEffect(()=>workflow.clear(),[query,category,dates.from,dates.to,workflow.deferredTab,active]);
 const changed=!!query||!!category||dates.from!==defaultDates.from||dates.to!==defaultDates.to;
 const reset=()=>{setQuery('');setCategory('');setDates(defaultDates);};
 const columns=isRequest?[
  {key:'number',label:'Номер',noWrap:true,render:(r:any)=><Smooth.div>{r.number}{workflow.workflow.deferred.includes(r.id)&&<small><StatusBadge value="Отложено"/></small>}</Smooth.div>},{key:'description',label:'Описание'},
  {key:'customerOrgId',label:'Заказчик',render:(r:any)=>organization(r.customerOrgId)},
  {key:'executorOrgId',label:'Исполнитель',render:(r:any)=>organization(r.executorOrgId)},
  {key:'period',label:'Период работ'},{key:'status',label:'Статус',render:(r:any)=><StatusBadge value={r.status}/>},
 ]:isWaybill?[
  {key:'number',label:'Номер',noWrap:true,render:(r:any)=><Smooth.div>{r.number}{workflow.workflow.deferred.includes(r.id)&&<small><StatusBadge value="Отложено"/></small>}</Smooth.div>},{key:'plate',label:'ТС',noWrap:true},{key:'driver',label:'Водитель'},
  {key:'operator',label:'Эксплуататор'},{key:'period',label:'Период'},
  {key:'form',label:'Форма',noWrap:true},{key:'status',label:'Статус',render:(r:any)=><StatusBadge value={r.status}/>},
 ]:catalog==='contractors'?[
  {key:'name',label:'Наименование'},{key:'inn',label:'ИНН',render:(r:any)=>r.inn??'Не указан'},
  {key:'city',label:'Город'},{key:'contact',label:'Контактное лицо'},{key:'phone',label:'Телефон',noWrap:true},
 ]:[{key:'name',label:'Наименование'},{key:'organization',label:'Юридическое лицо'},{key:'city',label:'Базирование'}];
 const heading=isRequest?'Реестр заявок':isWaybill?'Реестр путевых листов':catalog==='contractors'?'Контрагенты':'Подразделения';
 return <Smooth.section className="ektp-registry" data-kind={kind} hidden={!active} aria-label={heading}>
  <Smooth.div className="ektp-registry-heading"><h3>{heading}</h3></Smooth.div>
  {!isDirectory&&<Tabs value={workflow.deferredTab?'deferred':'all'} onChange={(value:string)=>workflow.setDeferredTab(value==='deferred')} items={[{id:'all',label:'Все записи · '+workflow.active.length},...(workflow.deferred.length?[{id:'deferred',label:'Отложенные · '+workflow.deferred.length}]:[])]}/>}
  <Smooth.div className="ektp-registry-filters">{isDirectory?<><Segmented value={catalog} onChange={(value:string)=>{setCatalog(value);setQuery('');}} items={[{id:'contractors',label:'Контрагенты'},{id:'departments',label:'Подразделения'}]}/><small>Доступно только чтение</small></>:<>
   <Select aria-label={isRequest?'Статус заявки':'Форма путевого листа'} value={category} onChange={e=>setCategory(e.target.value)}><option value="">{isRequest?'Статус · Все':'Форма · Все'}</option>{(isRequest?[...new Set(fixture.requests.map(r=>r.status))]:['Электронная','Бумажная']).map(s=><option key={s}>{s}</option>)}</Select>
   <Button tone="tertiary" className="registry-period" data-tooltip={isRequest?'Отобрать заявки по дате создания':'Отобрать путевые листы, чей период действия пересекается с выбранными датами'} onClick={()=>{setDraft({...dates});setError('');setPeriod(true);}}><strong>{isRequest?'Созданы:':'Период:'}</strong> {date(dates.from)}–{date(dates.to)}</Button>
  </>}{changed&&<Button tone="gray-tertiary" onClick={reset}>Сбросить</Button>}<Search value={query} onChange={setQuery} placeholder={isRequest?'Номер заявки или описание':isWaybill?'Номер ПЛ, ТС или водитель':catalog==='contractors'?'Название или ИНН контрагента':'Название подразделения'}/></Smooth.div>
  {!isDirectory&&<BatchActions workflow={workflow} rows={filtered} noun={isRequest?'заявки':'путевые листы'}/>}
  <DataTable checkedIds={workflow.checked} onCheckedChange={isDirectory?undefined:workflow.setChecked} tableLabel={heading} key={isDirectory?catalog:kind} rows={filtered} measurementRows={rows} columns={columns} initialSort={isDirectory?'name':'id'} pageSize={12} onSelect={(r:any)=>onOpen(isDirectory?catalog:kind,r.id)} emptyText="Ничего не найдено" onResetEmpty={reset}/>
  {period&&<Modal initialFocus=".datetime-trigger" title={isRequest?'Дата создания заявки':'Период действия путевого листа'} onClose={()=>setPeriod(false)} footer={<><Button onClick={()=>setPeriod(false)}>Отмена</Button><Button tone="primary" onClick={()=>{if(!draft.from||!draft.to||draft.from>draft.to){setError('Начало должно быть не позже окончания.');return;}setDates({...draft});setPeriod(false);}}>Применить</Button></>}><DateTimeGroup><Field label="С"><DateTimeField autoOpen dateOnly value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value.slice(0,10)})}/></Field><Field label="По"><DateTimeField dateOnly value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value.slice(0,10)})}/></Field></DateTimeGroup>{error&&<p role="alert" className="error">{error}</p>}</Modal>}
 </Smooth.section>;
}

function RecordFields({items}:any){return <dl className="ektp-record-fields">{items.map(([label,value]:any)=><DetailRow key={label} label={label}>{value}</DetailRow>)}</dl>;}

export default function EktpSections({section,theme,range,periodChosen,onMapVehicle,mapScopeContains}:any){
 const [records,setRecords]=useState<Record<string,any>>({}),[vehicleId,setVehicleId]=useState(''),[vehicleTab,setVehicleTab]=useState('info'),[overlay,setOverlay]=useState(''),[channel,setChannel]=useState('fuel');
 const record=records[section];
 const recordHeading=useRef<HTMLHeadingElement>(null),registryTriggers=useRef<Record<string,HTMLElement>>({});
 useEffect(()=>{if(record)recordHeading.current?.focus();else registryTriggers.current[section]?.focus();},[record?.id,section]);
 const open=(kind:string,id:string)=>{if(!record)registryTriggers.current[section]=document.activeElement as HTMLElement;setRecords(prev=>({...prev,[section]:{kind,id}}));};
 const back=()=>setRecords(prev=>({...prev,[section]:null}));
 const request=record?.kind==='requests'?fixture.requests.find(r=>r.id===record.id):null;
 const task=record?.kind==='tasks'?fixture.tasks.find(t=>t.id===record.id):null;
 const parent=task?fixture.requests.find(r=>r.id===task.requestId):null;
 const waybill=record?.kind==='waybills'?fixture.waybills.find(w=>w.id===record.id):null;
 const contractor=record?.kind==='contractors'?fixture.contractors.find(c=>c.id===record.id):null;
 const unit=record?.kind==='departments'?fixture.departments.find(d=>d.id===record.id):null;
 const selected=vehicle(vehicleId),access=historyAvailability(vehicleId,range,periodChosen);
 const docTitle=request?.number||task?.number||waybill?.number||contractor?.name||unit?.name;
 const assignedId=task?.vehicleId||waybill?.vehicleId;
 const launchVehicle=()=>{if(assignedId){setVehicleId(assignedId);setVehicleTab('info');setOverlay('vehicle');}};
 return <Smooth.div className="ektp-section-pages" hidden={!['requests','waybills','catalogs'].includes(section)}>
  {['requests','waybills','catalogs'].map(kind=><Registry key={kind} kind={kind} active={section===kind&&!record} onOpen={open}/>)}
  {record&&docTitle&&<Smooth.section className="ektp-record" aria-label={docTitle}>
   <nav className="breadcrumbs" aria-label="Хлебные крошки"><Smooth.button onClick={back}>{titles[section]}</Smooth.button><Smooth.span>/</Smooth.span>{parent&&<><Smooth.button onClick={()=>open('requests',parent.id)}>{parent.number}</Smooth.button><Smooth.span>/</Smooth.span></>}<Smooth.span aria-current="page">{docTitle}</Smooth.span></nav>
   <Smooth.div className="ektp-record-title"><h3 ref={recordHeading} tabIndex={-1}>{task?'Задание ':''}{docTitle}</h3>{(request||waybill)&&<StatusBadge value={request?.status||waybill?.status}/>}</Smooth.div>
   <Smooth.div className="ektp-record-scroll">
   {request&&<><h3>{request.description}</h3><RecordFields items={[
    ['Дата создания',date(request.created)],['Подразделение',department(request.departmentId)],
    ['Период работ',request.period],['Количество заданий',request.taskIds.length],
    ['Внутренний заказчик',organization(request.customerOrgId)],['Исполнитель',organization(request.executorOrgId)],
    ['Контактное лицо',request.contact+' · '+request.phone],['Ответственный за заявку',request.responsible],
   ]}/><h3>Задания · {request.taskIds.length}</h3><Smooth.div className="ektp-task-table"><DataTable rows={fixture.tasks.filter(t=>request.taskIds.includes(t.id))} onSelect={(t:any)=>open('tasks',t.id)} columns={[{key:'number',label:'Задание'},{key:'route',label:'Маршрут'},{key:'vehicleId',label:'ТС',render:(t:any)=>vehicleName(t.vehicleId)},{key:'period',label:'Период'}]}/></Smooth.div></>}
   {task&&<><h3>{task.route}</h3><RecordFields items={[
    ['Потребность',task.need],['Период работ',task.period],['Исполнитель',organization(parent?.executorOrgId)],
    ['Транспортное средство',vehicleName(task.vehicleId)],['Водитель',task.driver||'Не назначен'],['Телефон',task.phone||'Не указан'],
   ]}/><p>{task.description}</p></>}
   {waybill&&<><RecordFields items={[
    ['Период действия',waybill.period],['Форма документа',waybill.form],
    ['Эксплуататор',organization(waybill.operatorOrgId)],['ТС',vehicleName(waybill.vehicleId)+' · '+vehicle(waybill.vehicleId)?.model],
    ['Водитель',waybill.driver],['Телефон',waybill.phone],
    ['Одометр при выезде',waybill.odometerStart===null?'Нет данных':waybill.odometerStart+' км'],
    ['Одометр при возвращении',waybill.odometerEnd===null?'Нет данных':waybill.odometerEnd+' км'],
   ]}/>{waybill.form==='Электронная'&&<><h3>Титулы электронного путевого листа</h3><RecordFields items={[
    ['Открытие и отправка',Math.min(4,waybill.titlesReceived)+' из 4 титулов'],['Закрытие',Math.max(0,waybill.titlesReceived-4)+' из 2 титулов'],
   ]}/><Smooth.div className="ektp-title-statuses">{Array.from({length:6},(_,i)=><StatusBadge key={i} value={i<waybill.titlesReceived?'Получен':'Ожидается'}>Титул {i+1} · {i<waybill.titlesReceived?'Получен':'Ожидается'}</StatusBadge>)}</Smooth.div></>}</>}
   {contractor&&<RecordFields items={[
    ['Наименование',contractor.name],['ИНН',contractor.inn??'Не указан'],['Город',contractor.city],
    ['Контактное лицо',contractor.contact],['Телефон',contractor.phone],['Электронная почта',contractor.email??'Не указана'],
   ]}/>}
   {unit&&<RecordFields items={[
    ['Наименование',unit.name],['Юридическое лицо',organization(unit.orgId)],['Базирование',unit.city],
    ['Родительское подразделение',unit.parent?department(unit.parent):'Корневой уровень'],
   ]}/>}
   {assignedId&&<Button tone="primary" onClick={launchVehicle}>Карточка ТС</Button>}
   </Smooth.div>
  </Smooth.section>}
  {selected&&overlay==='vehicle'&&<Modal initialFocus={vehicleTab==='sensors'?'[data-vehicle-period]':undefined} title={selected.plate} onClose={()=>setOverlay('')}>{!mapScopeContains(vehicleId)&&<p>При переходе к карте, истории или топливу будет выбрана область «Все юридические лица».</p>}<Smooth.div className="vehicle-modal"><VehicleCard onLocation={()=>{setOverlay('');onMapVehicle(vehicleId,'map');}} vehicle={{...selected,ownerName:organization((fleet.vehicleOwnerOrg as any)[vehicleId])}} theme={theme} tab={vehicleTab} onTab={setVehicleTab} range={range} knownHistory={access.statistics} onTelemetry={(key:string)=>{setChannel(key);setOverlay('telemetry');}} onHistory={()=>{if(access.movement){setOverlay('');onMapVehicle(vehicleId,'history');}else setOverlay('history-empty');}} onFuel={()=>{setOverlay('');onMapVehicle(vehicleId,'fuel');}}/></Smooth.div></Modal>}
  {overlay==='telemetry'&&selected&&<Modal title="Показания датчиков" wide onClose={()=>setOverlay('vehicle')} footer={<Button onClick={()=>setOverlay('vehicle')}>Назад к ТС</Button>}><h3>{selected.plate}</h3>{channel==='fuel'?<TelemetryPanel vehicleId={vehicleId} periodChosen={periodChosen} range={range}/>:<RecordFields items={[[channel,String((selected.sensors as any)?.[channel]??'Нет данных')]]}/>}</Modal>}
  {overlay==='history-empty'&&<Modal title="История движения" onClose={()=>setOverlay('vehicle')} footer={<Button onClick={()=>setOverlay('vehicle')}>Назад к ТС</Button>}><Empty text="История за выбранный период не найдена" description="Выберите другой период для просмотра маршрута."/></Modal>}
 </Smooth.div>;
}
