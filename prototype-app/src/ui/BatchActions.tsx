import {useId,useState} from 'react';
import Smooth from './Smooth';
import ActionRow from './ActionRow';
import ThemeImage from './ThemeImage';
import {Button,Modal} from './index';
export default function BatchActions({workflow,rows,noun='заявки'}:any){
 const [deleting,setDeleting]=useState<string[]|null>(null);
 const descriptionId=useId();
 const focusTab=(event:any)=>{const root=event.currentTarget.closest('.registry,.ektp-registry');requestAnimationFrame(()=>root?.querySelector('[role=tab][aria-selected=true]')?.focus());};
 const selected=rows.filter((row:any)=>workflow.checked.includes(row.id));
 return <>
  {!!selected.length&&<Smooth.div className="batch-toolbar" aria-label="Действия с выбранными записями"><Smooth.div className="batch-selection"><strong role="status">Выбрано: {selected.length}</strong><Button tone="text" onClick={e=>{focusTab(e);workflow.clear();}}>Снять выбор</Button></Smooth.div><ActionRow className="batch-buttons"><Button icon={workflow.deferredTab?undefined:"archive-down"} tone="outline" onClick={e=>{focusTab(e);workflow.apply(workflow.deferredTab?'resume':'defer',selected.map((row:any)=>row.id));}}>{workflow.deferredTab?'Вернуть в работу':'Отложить'}</Button><Button icon="trash" tone="alert-primary" onClick={()=>setDeleting(selected.map((row:any)=>row.id))}>Удалить</Button></ActionRow></Smooth.div>}
  {workflow.workflow.deleted.length>0&&<Smooth.div className="batch-notice"><Smooth.span role="status" aria-live="polite">{'Удалено записей: '+workflow.workflow.deleted.length}</Smooth.span>{workflow.workflow.deleted.length>0&&<Button tone="text" onClick={e=>{focusTab(e);workflow.apply('restore',workflow.workflow.deleted);}}>Восстановить удалённые</Button>}</Smooth.div>}
  {deleting&&<Modal title={'Удалить выбранные '+noun+'?'} descriptionId={descriptionId} className="batch-delete-dialog" initialFocus=".delete-cancel" returnFocus=".batch-buttons .alert-primary, .tabs [aria-selected=true]" onClose={()=>setDeleting(null)} footer={<><Button className="delete-cancel" tone="gray-tertiary" onClick={()=>setDeleting(null)}>Отмена</Button><Button icon="trash" tone="alert-primary" onClick={()=>{workflow.apply('delete',deleting);setDeleting(null);}}>Удалить</Button></>}><ThemeImage className="feedback-art" light="/assets/figma/delete-confirmation-light.png" dark="/assets/figma/delete-confirmation-dark.png"/><Smooth.div className="empty-copy"><h3>Выбрано записей: {deleting.length}</h3><p id={descriptionId}>{rows.filter((row:any)=>deleting.includes(row.id)).slice(0,3).map((row:any)=>row.number||row.name||row.id).join(', ')}{deleting.length>3?' и ещё '+(deleting.length-3):''}. Записи исчезнут из реестра. После удаления их можно восстановить.</p></Smooth.div></Modal>}
 </>;
}
