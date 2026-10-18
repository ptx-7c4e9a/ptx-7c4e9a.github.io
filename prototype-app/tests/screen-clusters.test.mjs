import {test} from 'node:test';
import assert from 'node:assert/strict';
import {screenClusters} from '../src/ektp/screen-clusters.mjs';
test('dense adjacent pairs become nonoverlapping groups, preserving every vehicle once',()=>{
 const points=Array.from({length:12},(_,i)=>({id:String(i),x:(i%3)*45,y:Math.floor(i/3)*45,coordinates:[i,i+1]}));
 const before=JSON.stringify(points),groups=screenClusters(points);
 assert.equal(groups.flatMap(g=>g.members).length,12);assert.equal(new Set(groups.flatMap(g=>g.members.map(p=>p.id))).size,12);
 assert.equal(JSON.stringify(points),before);assert.ok(groups.length<points.length);
});
test('zooming separates vehicles when their actual projected positions have space',()=>{
 const points=[{id:'a',x:0,y:0},{id:'b',x:30,y:0},{id:'c',x:200,y:200}];
 assert.equal(screenClusters(points).length,2);
 assert.equal(screenClusters(points.map(p=>({...p,x:p.x*8,y:p.y*8}))).length,3);
});
test('cluster centroids cannot leave overlapping bubbles after merges',()=>{
 const points=Array.from({length:44},(_,i)=>({id:String(i),x:Math.sin(i*13)*400,y:Math.cos(i*17)*400}));
 const groups=screenClusters(points);
 for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){
  const a=groups[i],b=groups[j];
  const rect=g=>g.members.length>1?[g.x-32,g.y-32,g.x+32,g.y+32]:[g.x-44,g.y-44,g.x+124,g.y+44];
  const [al,at,ar,ab]=rect(a),[bl,bt,br,bb]=rect(b);
  assert.ok(ar<=bl-12||br<=al-12||ab<=bt-12||bb<=at-12);
 }
});
