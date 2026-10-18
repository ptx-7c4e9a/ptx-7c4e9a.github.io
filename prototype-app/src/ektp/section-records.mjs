// C142: read-only authored fixture. Date semantics come from the Figma handoff.
export function matchingRecords(rows, {query='', fields=[], category='', categoryKey='', dates=null, dateMode='created'}={}) {
 const needle=query.trim().toLocaleLowerCase('ru');
 return rows.filter(row=>{
  if(needle&&!fields.some(key=>String(row[key]??'').toLocaleLowerCase('ru').includes(needle)))return false;
  if(category&&row[categoryKey]!==category)return false;
  if(!dates)return true;
  if(dateMode==='created')return row.created>=dates.from&&row.created<=dates.to;
  const from=Date.parse(dates.from+'T00:00:00+03:00'),to=Date.parse(dates.to+'T23:59:59.999+03:00');
  return Date.parse(row.startAt)<=to&&Date.parse(row.endAt)>=from;
 });
}
