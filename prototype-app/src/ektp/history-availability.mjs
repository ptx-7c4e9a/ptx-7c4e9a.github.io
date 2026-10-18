import {archiveAvailable} from './demo-records.mjs';
export const preparedHistoryRange={from:'2026-10-13T08:00',to:'2026-10-13T12:00'};
const moscowTime=value=>Date.parse(value+'+03:00');
export function historyAvailability(vehicleId,range,periodChosen){
 const includesPreparedDay=range.from.slice(0,10)<='2026-10-13'&&range.to.slice(0,10)>='2026-10-13';
 const day=includesPreparedDay?'2026-10-13':range.from.slice(0,10);
 const start=moscowTime(day+'T08:00'),end=moscowTime(day+'T12:00');
 const from=moscowTime(range.from),to=moscowTime(range.to);
 const overlaps=Number.isFinite(from)&&Number.isFinite(to)&&from<to&&from<end&&to>start;
 const movement=!periodChosen||(archiveAvailable(vehicleId,range)&&overlaps);
 // The prepared demonstration replays one road over 08:00–12:00.
 // A user-selected subperiod must not silently replay the complete road.
 const window=movement?(periodChosen?{from:Math.max(0,(from-start)/(end-start)),to:Math.min(1,(to-start)/(end-start))}:{from:0,to:1}):null;
 return {movement,window,statistics:archiveAvailable(vehicleId,range)&&Number.isFinite(from)&&Number.isFinite(to)&&from<to};
}
