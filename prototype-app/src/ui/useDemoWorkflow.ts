import {notifyAlert} from './SystemAlert';
import {useEffect,useState} from 'react';
import {changeWorkflow,emptyWorkflow,normalizeWorkflow} from './demo-workflow.mjs';
const prefix='proto-demo-workflow:';
export function resetDemoWorkflows(){
 for(const key of Object.keys(localStorage))if(key.startsWith(prefix))localStorage.removeItem(key);
 window.dispatchEvent(new Event('proto-demo-workflow-reset'));
}
export default function useDemoWorkflow(scope:string,rows:any[],enabled=true){
 const ids=rows.map(row=>row.id),signature=ids.join('|');
 const [workflow,setWorkflow]=useState<any>(()=>{try{return normalizeWorkflow(JSON.parse(localStorage.getItem(prefix+scope)||'null'),ids);}catch{return emptyWorkflow();}});
 const [checked,setChecked]=useState<string[]>([]),[deferredTab,setDeferredTab]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{if(enabled)localStorage.setItem(prefix+scope,JSON.stringify(workflow));},[workflow,scope,enabled]);
 useEffect(()=>{setWorkflow((value:any)=>normalizeWorkflow(value,ids));setChecked([]);},[signature]);
 useEffect(()=>{const reset=()=>{setWorkflow(emptyWorkflow());setChecked([]);setDeferredTab(false);setNotice('');};window.addEventListener('proto-demo-workflow-reset',reset);return()=>window.removeEventListener('proto-demo-workflow-reset',reset);},[]);
 const apply=(action:string,selection=checked)=>{
  setWorkflow((value:any)=>changeWorkflow(value,action,selection,ids));setChecked([]);
  if(selection.length){
   const count=selection.filter((id:string)=>ids.includes(id)).length;
   if(count)notifyAlert(action==='defer'?{tone:'info',title:'Записи отложены',body:`Выбрано: ${count}. Они доступны во вкладке «Отложенные».`}:action==='resume'?{tone:'success',title:'Записи возвращены в работу',body:`Возвращено: ${count}.`}:action==='restore'?{tone:'success',title:'Записи восстановлены',body:`Восстановлено: ${count}.`}:{tone:'warning',title:'Записи удалены',body:`Удалено: ${count}. Их можно восстановить в этом реестре.`});
  }
  setNotice(action==='defer'?'Отложено записей: '+selection.length+'. Они доступны во вкладке «Отложенные».':action==='resume'?'Возвращено в работу: '+selection.length:action==='restore'?'Записи восстановлены':'Удалено записей: '+selection.length+'. Доступно восстановление.');
 };
 const active=enabled?rows.filter(row=>!workflow.deleted.includes(row.id)):rows;
 const deferred=active.filter(row=>workflow.deferred.includes(row.id));
 useEffect(()=>{if(!deferred.length)setDeferredTab(false);},[deferred.length]);
 return {checked,setChecked,workflow,active,deferred,deferredTab,setDeferredTab,notice,apply,clear:()=>setChecked([])};
}
