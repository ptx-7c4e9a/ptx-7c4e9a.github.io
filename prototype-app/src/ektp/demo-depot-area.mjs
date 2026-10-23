import {parkingPose} from './dense-map-parking.mjs';

// Illustrative envelope around the authored parking lots, not a surveyed site boundary.
const origin=[37.616,55.3965],latMetres=111320,lngMetres=latMetres*Math.cos(origin[1]*Math.PI/180);
const toXY=([lng,lat])=>[(lng-origin[0])*lngMetres,(lat-origin[1])*latMetres];
const toGeo=([x,y])=>[origin[0]+x/lngMetres,origin[1]+y/latMetres];
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const points=Array.from({length:100},(_,i)=>toXY(parkingPose(Math.floor(i/10),i%10).coordinates))
 .flatMap(([x,y])=>Array.from({length:12},(_,i)=>[x+40*Math.cos(i*Math.PI/6),y+40*Math.sin(i*Math.PI/6)]))
 .sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
const lower=[],upper=[];
for(const p of points){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
for(const p of [...points].reverse()){while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
export const demoDepotArea=[...lower.slice(0,-1),...upper.slice(0,-1)].map(toGeo);
demoDepotArea.push(demoDepotArea[0]);
export const demoDepotLabel='Демонстрационная автобаза';
