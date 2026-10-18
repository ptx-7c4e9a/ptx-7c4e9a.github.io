import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readMotionHeads} from '../qa/read-motion-source.mjs';
import {loadingPoint} from '../src/ui/entry-scene.mjs';

test('all four native loading leaders travel upward; only a near-invisible wrap changes corridor end',()=>{
 const heads=readMotionHeads(new URL('../src/generated/LoaderBackground.tsx',import.meta.url));
 assert.equal(heads.length,4);
 let wraps=0;
 for(const head of heads){
  const xs=head.track.animate.x,ys=head.track.animate.y,alphas=head.track.animate.opacity;
  assert.equal(xs.length,ys.length);assert.equal(alphas.length,xs.length);
  for(let i=1;i<xs.length;i++){
   const before=loadingPoint(head.x+xs[i-1],head.y+ys[i-1]),after=loadingPoint(head.x+xs[i],head.y+ys[i]);
   if(after.y-before.y>100){
    assert.ok(Math.max(alphas[i-1],alphas[i])<.01,'A corridor wrap must be nearly invisible');wraps++;
   }else assert.ok(after.y<=before.y+.001,head.name+' must not travel down');
  }
 }
 assert.equal(wraps,1);
});
