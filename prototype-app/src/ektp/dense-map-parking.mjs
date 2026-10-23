// Illustrative parking, not a surveyed or approved oil-depot site plan.
// Access-track centreline traced from the visible Yandex map at zoom16 on2026-10-23.
// Vehicles are offset from that track; internal aisles remain free between rows.
const origin=[37.616,55.3965],metresLat=111320,metresLng=111320*Math.cos(origin[1]*Math.PI/180);
export const parkingAccessRoad=[[37.61459753, 55.39391693], [37.61451188, 55.39462223], [37.61464035, 55.39486543], [37.61541118, 55.39554639], [37.61519706, 55.39583823], [37.61528271, 55.3961179], [37.61575376, 55.39647053], [37.61628906, 55.39685964], [37.61693141, 55.39744329], [37.61785212, 55.39820932], [37.61853729, 55.39887807], [37.61887988, 55.39907261]];
const toXY=([lng,lat])=>[(lng-origin[0])*metresLng,(lat-origin[1])*metresLat];
const toGeo=([x,y])=>[origin[0]+x/metresLng,origin[1]+y/metresLat];
const path=parkingAccessRoad.map(toXY);
// Authored lot centres on the clear ground either side of the track. The south-west
// lots avoid its tighter bend; no perfect mirrored global grid is imposed.
export const parkingLots=[{"coordinates": [37.61656741, 55.39833091], "bearing": 35}, {"coordinates": [37.61496153, 55.39754057], "bearing": 25}, {"coordinates": [37.61324859, 55.3967502], "bearing": 45}, {"coordinates": [37.60982271, 55.39608142], "bearing": 70}, {"coordinates": [37.61335565, 55.39571663], "bearing": 70}, {"coordinates": [37.61967212, 55.39790534], "bearing": 35}, {"coordinates": [37.61860153, 55.39699339], "bearing": 25}, {"coordinates": [37.61742388, 55.39614222], "bearing": 30}, {"coordinates": [37.61935094, 55.39553423], "bearing": 75}, {"coordinates": [37.61078624, 55.39516943], "bearing": 65}];
const jitter=[-.7,.5,-.2,.9,-.5,.4,-.8,.3,-.1,.6];
export function parkingPose(group,slot){
 const lot=parkingLots[group],type=group%5,row=Math.floor(slot/5),bay=slot%5;
 const point=toXY(lot.coordinates),r=lot.bearing*Math.PI/180,along=[Math.sin(r),Math.cos(r)],normal=[along[1],-along[0]];
 const alongOffset=(bay-2)*22+(row?2:0)+jitter[slot];
 const outward=(row?25:-25)+jitter[(slot+3)%10];
 const coordinates=toGeo([point[0]+along[0]*alongOffset+normal[0]*outward,point[1]+along[1]*alongOffset+normal[1]*outward]);
 const angle=[0,12,-8,35,45][type];
 const heading=(lot.bearing+(row?270:90)+angle+jitter[slot]*2+360)%360;
 return {coordinates,heading};
}
export function parkingRoadClearance(coordinates){
 const p=toXY(coordinates);let distance=Infinity;
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));distance=Math.min(distance,Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t));}
 return distance;
}
