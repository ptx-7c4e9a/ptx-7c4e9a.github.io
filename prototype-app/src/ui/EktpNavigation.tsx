import {PopoverPresence} from './PopoverSurface';
import Smooth from './Smooth';
import {useId,useState} from 'react';
import {Icon} from './index';
import ActionPopover from './ActionPopover';

// Native EKTP structure:12303:633 / MenuGroup12411:57680; C142 destinations now have read-only source views.
export default function EktpNavigation({compact,section,onNavigate}:any){
 const [expanded,setExpanded]=useState(false),[anchor,setAnchor]=useState<HTMLElement|null>(null),id=useId();
 const monitoring=['map','zones'].includes(section);
 const select=(target:string)=>{setAnchor(null);onNavigate(target);};
 return <nav aria-label="Основные разделы" className="ektp-navigation">
  <Smooth.button aria-label="Главная" data-tooltip={compact?'Главная':undefined} onClick={()=>select('home')}><Icon name="home" size={20}/>{!compact&&<Smooth.span>Главная</Smooth.span>}</Smooth.button>
  <Smooth.button className={`monitoring-toggle ${monitoring?'selected':''}`} aria-label="Мониторинг" aria-expanded={compact?!!anchor:expanded} aria-controls={compact?undefined:id} aria-haspopup={compact?'menu':undefined} data-tooltip={compact&&!anchor?'Мониторинг':undefined} onClick={e=>compact?setAnchor(anchor?null:e.currentTarget):setExpanded(!expanded)}><Icon name="map" size={20}/>{!compact&&<><Smooth.span>Мониторинг</Smooth.span><Smooth.span className="disclosure-mark" aria-hidden="true"><Icon name="plus" size={20}/></Smooth.span></>}</Smooth.button>
  {!compact&&<Smooth.div className="sidebar-submenu-reveal" data-open={expanded} aria-hidden={!expanded} inert={!expanded} id={id}><Smooth.div className="sidebar-submenu">{[['map','Карта транспорта'],['zones','Геозоны']].map(([target,title])=><Smooth.button key={target} className={section===target?'selected':''} aria-current={section===target?'page':undefined} onClick={()=>select(target)}>{title}</Smooth.button>)}</Smooth.div></Smooth.div>}
  {[
   {id:'transport',title:'Транспорт',icon:'bus'},
   {id:'requests',title:'Заявки',icon:'ektp.imgSolarLinearClipboardText'},
   {id:'waybills',title:'Путевые листы',icon:'route'},
   {id:'reports',title:'Отчёты',icon:'chart'},
   {id:'catalogs',title:'Справочники',icon:'ektp.imgSolarLinearBook'},
  ].map(item=><Smooth.button key={item.id} className={section===item.id?'selected':''} aria-label={item.title} data-tooltip={compact?item.title:undefined} onClick={()=>select(item.id)}><Icon name={item.icon} size={20}/>{!compact&&<Smooth.span>{item.title}</Smooth.span>}</Smooth.button>)}
  <PopoverPresence>{anchor&&<ActionPopover key="sidebar-monitoring" anchor={anchor} placement="sidebar" title="Мониторинг" onClose={()=>setAnchor(null)} items={[{id:'map',label:'Карта транспорта',selected:section==='map',icon:'map',onClick:()=>select('map')},{id:'zones',label:'Геозоны',selected:section==='zones',icon:'map',onClick:()=>select('zones')}]}/>}</PopoverPresence>
 </nav>;
}
