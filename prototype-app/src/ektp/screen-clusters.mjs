// Screen-space collision grouping. Geographic vehicle positions are never moved.
export function screenClusters(points){
 const groups=points.map(point=>({members:[point],x:point.x,y:point.y}));
 const bounds=g=>g.members.length>1?{left:g.x-32,right:g.x+32,top:g.y-32,bottom:g.y+32}:
  {left:g.x-44,right:g.x+(g.members[0].labelRight??124),top:g.y-44,bottom:g.y+44};
 const overlaps=(a,b)=>{const x=bounds(a),y=bounds(b);return x.left<y.right+12&&x.right+12>y.left&&x.top<y.bottom+12&&x.bottom+12>y.top;};
 // Recheck centroids after every merge: adjacent groups cannot overlap after reduction.
 let changed=true;while(changed){changed=false;outer:for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)if(overlaps(groups[i],groups[j])){
  const members=[...groups[i].members,...groups[j].members];groups[i]={members,x:members.reduce((s,p)=>s+p.x,0)/members.length,y:members.reduce((s,p)=>s+p.y,0)/members.length};groups.splice(j,1);changed=true;break outer;
 }}
 return groups.map(g=>({...g,key:g.members.map(p=>p.id).sort().join('|')}));
}
