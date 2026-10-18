import Smooth from '../ui/Smooth';
import ReorderSummary from '../ui/ReorderSummary';
import {IconButton} from '../ui';
export default function KpiGrid({items,onInfo}:any){return <ReorderSummary items={items.map((i:any)=>({...i,className:'kpi-card surface elevated-card'}))} className="kpi-grid" storageKey="proto-klk-kpi-order" renderItem={(item:any)=><><Smooth.button className="kpi-content" type="button" onClick={item.action}><Smooth.span>{item.label}</Smooth.span><strong>{item.count}</strong><small>{item.unit}</small></Smooth.button><IconButton className="icon-button kpi-info" name="info" label={'О показателе: '+item.label} onClick={()=>onInfo(item.id)}/></>}/>;}
