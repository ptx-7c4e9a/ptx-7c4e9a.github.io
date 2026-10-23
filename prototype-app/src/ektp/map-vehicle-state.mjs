import {screenClusters} from './screen-clusters.mjs';
// Shared map presentation rules. No source fleet or BI records are modified here.
export function fleetOwnership(vehicle) {
 const value=String(vehicle?.kind||'').toLowerCase();
 return /собств/.test(value)?'owned':/на[её]мн/.test(value)?'hired':'unknown';
}
export function fleetOwnershipLabel(vehicle) {
 return {owned:'Собственный парк',hired:'Наёмный парк',unknown:'Принадлежность не указана'}[fleetOwnership(vehicle)];
}
export function vehicleTypeLabel(vehicle) {
 const model=String(vehicle?.vehicleType||vehicle?.model||'');
 if(/полуприцеп|тягач/i.test(model))return 'Автотопливозаправщик · полуприцеп';
 if(/вахтов|автобус|4208/i.test(model))return 'Вахтовый автобус';
 if(/фургон|Sprinter|Соболь|ГАЗ/i.test(model))return 'Сервисный фургон';
 if(/Борт|43253/i.test(model))return 'Бортовой грузовик';
 return 'Автотопливозаправщик';
}
export function mapPreviewPlacement(anchor,bounds,size) {
 const gap=24,pad=12,width=Math.min(size.width,Math.max(0,bounds.right-bounds.left-pad*2));
 const height=Math.min(size.height,Math.max(0,bounds.bottom-bounds.top-pad*2));
 const left=anchor.x-width-gap>=bounds.left+pad?anchor.x-width-gap:anchor.x+gap;
 const top=anchor.y-height/2;
 return {left:Math.max(bounds.left+pad,Math.min(left,bounds.right-width-pad)),top:Math.max(bounds.top+pad,Math.min(top,bounds.bottom-height-pad))};
}

// At maximum zoom every vehicle is independent. Mid-scale parking groups keep
// their authored type/ownership structure; the overview still uses spatial clustering.
export function mapVehicleGroups(points,zoom,previewId=''){
 const single=p=>({members:[p],x:p.x,y:p.y,key:p.id});
 if(zoom>=17.95)return points.map(single);
 const focused=points.find(p=>p.id===previewId),others=points.filter(p=>p!==focused);
 let groups;
 if(zoom>=16){
  const parking=new Map(),regular=[];
  for(const p of others){if(p.v.demoGroup){if(!parking.has(p.v.demoGroup))parking.set(p.v.demoGroup,[]);parking.get(p.v.demoGroup).push(p);}else regular.push(p);}
  groups=[...screenClusters(regular),...[...parking.values()].map(members=>({members,x:members.reduce((sum,p)=>sum+p.x,0)/members.length,y:members.reduce((sum,p)=>sum+p.y,0)/members.length,key:members.map(p=>p.id).sort().join('|')}))];
 }else groups=screenClusters(others);
 return [...groups,...(focused?[single(focused)]:[])];
}
