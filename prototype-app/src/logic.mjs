export function compare(a,b,dir=1){const empty=x=>x===null||x===undefined||x==='';if(empty(a)||empty(b))return empty(a)===empty(b)?0:empty(a)?1:-1;return (typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b),'ru',{numeric:true}))*dir;}
export function selectRows(rows,{query='',filters={},sortKey='id',sortDir=1}={}){const q=query.trim().toLocaleLowerCase('ru');return rows.filter(r=>(!q||Object.values(r).filter(v=>['string','number'].includes(typeof v)).join(' ').toLocaleLowerCase('ru').replace(/\s/g,'').includes(q.replace(/\s/g,'')))&&Object.entries(filters).every(([k,v])=>!v||(Array.isArray(r[k])?r[k].some(item=>String(item)===String(v)):String(r[k])===String(v)))).slice().sort((a,b)=>compare(a[sortKey],b[sortKey],sortDir)||String(a.id).localeCompare(String(b.id),'ru',{numeric:true}));}
export function assignTasks(state,requestId,taskIds,resourceRows){
 if(!taskIds.length||!resourceRows.length||resourceRows.some(r=>!r.vehicleId||!r.driverIds?.length))throw Error('Выберите задание, транспорт и водителя');
 if(taskIds.some(id=>!state.tasks.some(t=>t.id===id&&t.requestId===requestId)))throw Error('Задание не относится к выбранной заявке');
 if(resourceRows.some(r=>!state.vehicles.some(v=>v.id===r.vehicleId)||r.driverIds.some(id=>!state.drivers.some(d=>d.id===id))||(r.terminalIds||[]).some(id=>!state.terminals.some(t=>t.id===id))))throw Error('Выбранный ресурс отсутствует в реестре');
 const next=structuredClone(state);
 next.assignments=next.assignments.map(a=>({...a,selectedTaskIds:a.selectedTaskIds.filter(id=>!taskIds.includes(id))})).filter(a=>a.selectedTaskIds.length);
 next.assignments.push({id:'LOCAL-'+taskIds.join('-'),selectedTaskIds:[...new Set(taskIds)],resourceRows:structuredClone(resourceRows)});
 for(const t of next.tasks)if(taskIds.includes(t.id)){t.status='Assigned';t.vehicleId=resourceRows[0].vehicleId;t.driverId=resourceRows[0].driverIds[0];}
 return next;
}
export function rankCandidates(candidates,selectedIds){return candidates.filter(c=>selectedIds.includes(c.vehicleId)).slice().sort((a,b)=>compare(a.etaSeconds,b.etaSeconds)||a.vehicleId.localeCompare(b.vehicleId));}
export function formatDateTimeInput(value,dateOnly=false){
 if(!value)return '';
 return `${value.slice(8,10)}.${value.slice(5,7)}.${value.slice(0,4)}`+(dateOnly?'':` ${value.slice(11,16)}`);
}
export function parseDateTimeInput(text,dateOnly=false){
 const match=text.trim().match(dateOnly?/^(\d{2})\.(\d{2})\.(\d{4})$/:/^(\d{2})\.(\d{2})\.(\d{4})[ ,]+(\d{2}):(\d{2})$/);
 if(!match)return '';
 const [,day,month,year,hour='00',minute='00']=match;
 const date=new Date(0);date.setUTCFullYear(Number(year),Number(month)-1,Number(day));
 if(date.getUTCFullYear()!==Number(year)||date.getUTCMonth()!==Number(month)-1||date.getUTCDate()!==Number(day)||Number(hour)>23||Number(minute)>59)return '';
 return `${year}-${month}-${day}`+(dateOnly?'':`T${hour}:${minute}`);
}
export function formatPeriod(range){
 const day=value=>`${value.slice(8,10)}.${value.slice(5,7)}.${value.slice(0,4)}`;
 const fromTime=range.from.slice(11,16),toTime=range.to.slice(11,16);
 return range.from.slice(0,10)===range.to.slice(0,10)?`${day(range.from)} · ${fromTime}–${toTime}`:`${day(range.from)}, ${fromTime} — ${day(range.to)}, ${toTime}`;
}
export function formatPeriodButton(range){
 const crossYear=range.from.slice(0,4)!==range.to.slice(0,4);
 const sameDay=range.from.slice(0,10)===range.to.slice(0,10);
 const day=value=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:sameDay?'long':'short',...(crossYear?{year:'numeric'}:{})}).format(new Date(value));
 return sameDay?`${day(range.from)} · ${range.from.slice(11,16)}–${range.to.slice(11,16)}`:`${day(range.from)}, ${range.from.slice(11,16)} — ${day(range.to)}, ${range.to.slice(11,16)}`;
}
export function validRange(from,to){return !!from&&!!to&&Number.isFinite(Date.parse(from))&&Number.isFinite(Date.parse(to))&&Date.parse(from)<=Date.parse(to);}
export function parseLocalDate(value){const [date,time='00:00']=value.split('T'),[year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number);return new Date(year,month-1,day,hour,minute);}
export function localDateValue(date){const pad=v=>String(v).padStart(2,'0');return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;}
export function calendarDays(year,month){const first=new Date(year,month,1),offset=(first.getDay()+6)%7;return Array.from({length:42},(_,i)=>new Date(year,month,1-offset+i));}
export function fitToolbar(actions,available,gap=8){const visible=[...actions],hidden=[];const width=()=>visible.reduce((s,a)=>s+a.width,0)+Math.max(0,visible.length-1)*gap;while(visible.length&&width()>available){let index=0;for(let i=1;i<visible.length;i++)if((visible[i].priority??0)<(visible[index].priority??0))index=i;hidden.push(visible[index].id);visible.splice(index,1);}return{visible:visible.map(a=>a.id),hidden:actions.filter(a=>hidden.includes(a.id)).map(a=>a.id)};}
export function pointAlong(coords,t){if(!coords?.length)return null;if(coords.length===1)return coords[0];const lengths=[0];let total=0;for(let i=1;i<coords.length;i++){const dx=(coords[i][0]-coords[i-1][0])*Math.cos(coords[i][1]*Math.PI/180),dy=coords[i][1]-coords[i-1][1];total+=Math.hypot(dx,dy);lengths.push(total);}const target=Math.max(0,Math.min(1,t))*total;let i=1;while(i<lengths.length-1&&lengths[i]<target)i++;const k=(target-lengths[i-1])/(lengths[i]-lengths[i-1]||1);return[coords[i-1][0]+(coords[i][0]-coords[i-1][0])*k,coords[i-1][1]+(coords[i][1]-coords[i-1][1])*k];}
