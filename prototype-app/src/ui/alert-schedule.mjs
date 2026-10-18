export const ALERT_VISIBLE_MS=4000;
export const ALERT_MIN_INTERVAL_MS=45000;
export const ALERT_MAX_INTERVAL_MS=90000;
export function nextAlertDelay(random=Math.random){
 return ALERT_MIN_INTERVAL_MS+Math.floor(Math.max(0,Math.min(1,random()))*(ALERT_MAX_INTERVAL_MS-ALERT_MIN_INTERVAL_MS));
}
export function pickAlertIndex(length,previous,random=Math.random){
 if(length<=1)return 0;
 const alternatives=Array.from({length},(_,index)=>index).filter(index=>index!==previous);
 return alternatives[Math.min(alternatives.length-1,Math.floor(Math.max(0,random())*alternatives.length))];
}
