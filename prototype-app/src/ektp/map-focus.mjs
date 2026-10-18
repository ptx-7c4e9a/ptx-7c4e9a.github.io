// YMap margins use [top, right, bottom, left] in CSS pixels.
// Reserve the inspector and the bottom controls before centering or fitting a zone.
export function mapFocusMargins(map,panel){
 const width=Math.max(0,map.right-map.left),height=Math.max(0,map.bottom-map.top);
 const left=Math.min(24,Math.max(0,(width-96)/2)),top=Math.min(24,Math.max(0,(height-96)/2));
 const bottom=Math.min(80,Math.max(top,height-96-top));
 const overlaps=panel&&panel.right>map.left&&panel.left<map.right&&panel.bottom>map.top&&panel.top<map.bottom;
 const right=Math.min(Math.max(left,overlaps?map.right-panel.left+24:left),Math.max(left,width-96-left));
 return[top,right,bottom,left];
}

// GenericBounds corners: south-west, north-east; preserve [longitude, latitude].
// Fitting all vertices avoids treating the first polygon vertex as the target.
export function zoneBounds(ring){
 if(!Array.isArray(ring)||ring.length<3||ring.some(p=>!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])))throw new TypeError('A zone needs a finite polygon ring');
 const lng=ring.map(p=>p[0]),lat=ring.map(p=>p[1]);
 return[[Math.min(...lng),Math.min(...lat)],[Math.max(...lng),Math.max(...lat)]];
}
