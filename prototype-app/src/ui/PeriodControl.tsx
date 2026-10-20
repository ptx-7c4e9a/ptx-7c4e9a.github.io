import Smooth from './Smooth';
import {Button,Icon,IconButton} from './index';
import {useLayoutEffect,useRef} from 'react';

export default function PeriodControl({label,onClick,onReset,tooltip='Изменить период',className=''}:any){
 const button=useRef<HTMLButtonElement>(null),resetPending=useRef(false);
 useLayoutEffect(()=>{if(!onReset&&resetPending.current){resetPending.current=false;button.current?.focus();}},[!!onReset]);
 const split=typeof label==='string'&&label.startsWith('Период:')?['Период:',label.slice('Период:'.length)]:null;
 const text=split?<><strong>{split[0]}</strong>{split[1]}</>:label;
 const trigger={ref:button,'data-period-trigger':'true','aria-haspopup':'dialog' as const,'data-tooltip':tooltip,onClick,type:'button' as const};
 if(!onReset)return <Button {...trigger} className={'period-action '+className} tone="outline" icon="calendar">{text}</Button>;
 return <Smooth.div className={`toolbar-action-resettable period-action ${className}`} role="group" aria-label="Выбранный период">
  <Smooth.button {...trigger} className="period-trigger"><Icon name="calendar" size={20}/><span>{text}</span></Smooth.button>
  <IconButton className="icon-button period-reset" name="close" label="Сбросить период" onClick={()=>{resetPending.current=true;button.current?.focus();onReset();}}/>
 </Smooth.div>;
}
