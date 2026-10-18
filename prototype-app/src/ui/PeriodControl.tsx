import Smooth from './Smooth';
import {Button,IconButton} from './index';

export default function PeriodControl({label,onClick,onReset,tooltip='Изменить период'}:any){
 const split=typeof label==='string'&&label.startsWith('Период:')?['Период:',label.slice('Период:'.length)]:null;
 return <Smooth.div className={`toolbar-action ${onReset?'toolbar-action-resettable':''}`}>
  <Button data-period-trigger="true" tone="outline" icon="calendar" data-tooltip={tooltip} onClick={onClick}>{split?<><strong>{split[0]}</strong>{split[1]}</>:label}</Button>
  {onReset&&<IconButton name="close" label="Сбросить период" onClick={e=>{(e.currentTarget.previousElementSibling as HTMLButtonElement)?.focus();onReset();}}/>}
 </Smooth.div>;
}
