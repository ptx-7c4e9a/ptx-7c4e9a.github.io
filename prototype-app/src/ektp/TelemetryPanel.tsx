import Smooth from '../ui/Smooth';
import PeriodControl from '../ui/PeriodControl';
import TelemetryChart from './TelemetryChart';
import {useState} from 'react';
import series from '../data/telemetry-series.json';
import FeedbackState from '../ui/FeedbackState';
import {readingAt} from './telemetry.mjs';
import {telemetryFixture} from './telemetry-fixture.mjs';
import {formatPeriodButton} from '../logic.mjs';

export default function TelemetryPanel({vehicleId,range,periodChosen,onPeriod,onReset}:any){
 const [selected,setSelected]=useState(series.channels.map(c=>c.id)),[cursor,setCursor]=useState<number|null>(null);
 const {available,sourceDate,channels}=telemetryFixture(series.channels,vehicleId,range,periodChosen);
 const multiday=range.from.slice(0,10)!==range.to.slice(0,10),visible=channels.filter((c:any)=>selected.includes(c.id));
 return <>
  <div className="telemetry-period">{onPeriod?<PeriodControl label={"Период: "+formatPeriodButton(range)} onClick={onPeriod} onReset={onReset}/>:<span>Период: {formatPeriodButton(range)}</span>}</div>
  {!available||!channels.length?<FeedbackState kind="info" title="За этот период данных нет" description="Измените период, чтобы посмотреть историю показаний."/>:<Smooth.div className="telemetry-panel">
   <Smooth.fieldset className="telemetry-channels"><legend>Каналы</legend>{series.channels.map(c=><Smooth.label key={c.id}><Smooth.input type="checkbox" checked={selected.includes(c.id)} onChange={e=>setSelected(e.target.checked?[...selected,c.id]:selected.filter(id=>id!==c.id))}/>{c.label}</Smooth.label>)}</Smooth.fieldset>
   {!visible.length?<FeedbackState title="Выберите каналы" description="Отметьте каналы, чтобы увидеть показания и графики."/>:<Smooth.div className="telemetry-plots">
    <Smooth.div className="telemetry-readout" aria-live="polite">{visible.map(c=>{const reading=readingAt(c,cursor??720);return <Smooth.div key={c.id}><small>{c.label}</small><strong>{reading.value}</strong><small>{multiday?sourceDate.slice(8)+'.'+sourceDate.slice(5,7)+' · ':''}{reading.time}</small></Smooth.div>;})}</Smooth.div>
    {visible.map(c=><Smooth.section className="telemetry-plot" key={c.id}><h3>{c.label}</h3><TelemetryChart channel={c} cursor={cursor} onCursor={setCursor} range={range} sourceDate={sourceDate}/></Smooth.section>)}
   </Smooth.div>}
  </Smooth.div>}
 </>;
}
