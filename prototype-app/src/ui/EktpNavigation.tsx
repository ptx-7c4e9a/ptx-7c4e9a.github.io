import {PopoverPresence} from './PopoverSurface';
import Smooth from './Smooth';
import {useId,useState} from 'react';
import {Icon} from './index';
import ActionPopover from './ActionPopover';
import {biNavigation,biPages} from '../ektp/bi-data.mjs';

// Native EKTP structure:12303:633 / MenuGroup12411:57680; C142 destinations now have read-only source views.
export default function EktpNavigation({compact,section,onNavigate}:any){
 const [expanded,setExpanded]=useState(false),[reportsExpanded,setReportsExpanded]=useState(false),[anchor,setAnchor]=useState<HTMLElement|null>(null),[anchorGroup,setAnchorGroup]=useState('monitoring'),id=useId(),reportsId=useId();
 const monitoring=['map','zones'].includes(section);
 const reports=section==='reports'||biPages.includes(section);
 const select=(target:string)=>{setAnchor(null);onNavigate(target);};
 return <nav aria-label="Основные разделы" className="ektp-navigation">
  <Smooth.button aria-label="Главная" data-tooltip={compact?'Главная':undefined} onClick={()=>select('home')}><Icon name="home" size={20}/>{!compact&&<Smooth.span>Главная</Smooth.span>}</Smooth.button>
  <Smooth.button className={`navigation-group-toggle monitoring-toggle ${monitoring?'selected':''}`} aria-label="Мониторинг" aria-expanded={compact?!!anchor&&anchorGroup==='monitoring':expanded} aria-controls={compact?undefined:id} aria-haspopup={compact?'menu':undefined} data-tooltip={compact&&!anchor?'Мониторинг':undefined} onClick={e=>{if(compact){setAnchor(anchor&&anchorGroup==='monitoring'?null:e.currentTarget);setAnchorGroup('monitoring');}else setExpanded(!expanded);}}><Icon name="map" size={20}/>{!compact&&<><Smooth.span>Мониторинг</Smooth.span><Smooth.span className="disclosure-mark" aria-hidden="true"><Icon name="plus" size={20}/></Smooth.span></>}</Smooth.button>
  {!compact&&<Smooth.div className="sidebar-submenu-reveal" data-open={expanded} aria-hidden={!expanded} inert={!expanded} id={id}><Smooth.div className="sidebar-submenu">{[['map','Карта транспорта'],['zones','Геозоны']].map(([target,title])=><Smooth.button key={target} className={section===target?'selected':''} aria-current={section===target?'page':undefined} onClick={()=>select(target)}>{title}</Smooth.button>)}</Smooth.div></Smooth.div>}
  {[
   {id:'transport',title:'Транспорт',icon:'bus'},
   {id:'requests',title:'Заявки',icon:'ektp.imgSolarLinearClipboardText'},
   {id:'waybills',title:'Путевые листы',icon:'route'},
  ].map(item=><Smooth.button key={item.id} className={section===item.id?'selected':''} aria-label={item.title} data-tooltip={compact?item.title:undefined} onClick={()=>select(item.id)}><Icon name={item.icon} size={20}/>{!compact&&<Smooth.span>{item.title}</Smooth.span>}</Smooth.button>)}
  <Smooth.button className={`navigation-group-toggle reports-toggle ${reports?'selected':''}`} aria-label="Отчёты" aria-expanded={compact?!!anchor&&anchorGroup==='reports':reportsExpanded} aria-controls={compact?undefined:reportsId} aria-haspopup={compact?'menu':undefined} data-tooltip={compact&&!anchor?'Отчёты':undefined} onClick={e=>{if(compact){setAnchor(anchor&&anchorGroup==='reports'?null:e.currentTarget);setAnchorGroup('reports');}else setReportsExpanded(!reportsExpanded);}}><Icon name="chart" size={20}/>{!compact&&<><Smooth.span>Отчёты</Smooth.span><Smooth.span className="disclosure-mark" aria-hidden="true"><Icon name="plus" size={20}/></Smooth.span></>}</Smooth.button>
  {!compact&&<Smooth.div className="sidebar-submenu-reveal" data-open={reportsExpanded} aria-hidden={!reportsExpanded} inert={!reportsExpanded} id={reportsId}><Smooth.div className="sidebar-submenu">{biNavigation.map(item=><Smooth.button key={item.id} className={section===item.id?'selected':''} aria-current={section===item.id?'page':undefined} onClick={()=>select(item.id)}>{item.label}</Smooth.button>)}</Smooth.div></Smooth.div>}
  <Smooth.button className={section==='catalogs'?'selected':''} aria-label="Справочники" data-tooltip={compact?'Справочники':undefined} onClick={()=>select('catalogs')}><Icon name="ektp.imgSolarLinearBook" size={20}/>{!compact&&<Smooth.span>Справочники</Smooth.span>}</Smooth.button>
  <PopoverPresence>{anchor&&<ActionPopover key={'sidebar-'+anchorGroup} anchor={anchor} placement="sidebar" title={anchorGroup==='reports'?'Отчёты':'Мониторинг'} onClose={()=>setAnchor(null)} items={anchorGroup==='reports'?biNavigation.map(item=>({...item,selected:section===item.id,onClick:()=>select(item.id)})):[{id:'map',label:'Карта транспорта',selected:section==='map',icon:'map',onClick:()=>select('map')},{id:'zones',label:'Геозоны',selected:section==='zones',icon:'map',onClick:()=>select('zones')}]}/>}</PopoverPresence>
 </nav>;
}
