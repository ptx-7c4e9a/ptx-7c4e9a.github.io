export function pageItems(current,total){
 const count=Math.max(1,Math.floor(total));
 const page=Math.max(0,Math.min(count-1,current));
 if(count<=7)return Array.from({length:count},(_,i)=>i);
 const keep=new Set([0,count-1,page-1,page,page+1]);
 if(page<3)[0,1,2,3,4].forEach(i=>keep.add(i));
 if(page>count-4)[count-5,count-4,count-3,count-2,count-1].forEach(i=>keep.add(i));
 const sorted=[...keep].filter(i=>i>=0&&i<count).sort((a,b)=>a-b),out=[];
 sorted.forEach((i,index)=>{if(index&&i-sorted[index-1]>1)out.push('gap-'+i);out.push(i);});
 return out;
}
