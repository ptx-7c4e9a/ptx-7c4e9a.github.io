import {useSyncExternalStore} from 'react';
import {mapVehicleReadings} from './map-telemetry.mjs';
const born=performance.now(),listeners=new Set<()=>void>();
let seconds=0,timer:ReturnType<typeof setInterval>|undefined;
const snapshot=()=>seconds;
function subscribe(listener:()=>void){
 listeners.add(listener);
 if(!timer)timer=setInterval(()=>{if(document.hidden)return;seconds=Math.floor((performance.now()-born)/1000);for(const listener of listeners)listener();},1000);
 return()=>{listeners.delete(listener);if(!listeners.size){clearInterval(timer);timer=undefined;}};
}
export default function useMapReadings(vehicle:any){return mapVehicleReadings(vehicle,useSyncExternalStore(subscribe,snapshot,snapshot));}
