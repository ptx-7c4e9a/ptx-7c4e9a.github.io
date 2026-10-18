import {poseAlong} from './vehicle-motion.mjs';

export function historyPosition(progress,window={from:0,to:1}){
 return window.from+(window.to-window.from)*Math.max(0,Math.min(1,progress));
}
export function historyRoad(road,window={from:0,to:1}){
 const start=window.from*road.total,end=window.to*road.total;
 const middle=road.path.filter((_,i)=>road.cumulative[i]>start&&road.cumulative[i]<end);
 return [poseAlong(road,window.from).coordinates,...middle,poseAlong(road,window.to).coordinates];
}
