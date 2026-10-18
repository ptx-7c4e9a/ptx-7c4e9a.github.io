import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadingPoint,fadeCenters,loadingTrajectoryBox} from '../src/ui/entry-scene.mjs';

test('every extended loading line ends outside the visible stage',()=>{
 for(let i=0;i<4;i++){
  const box=loadingTrajectoryBox(i);
  for(const p of box.endpoints)assert.ok(p.x<0||p.x>1440||p.y<0||p.y>900,`line${i+1} must not end inside the viewport`);
  assert.ok(box.width>0&&box.height>1140);
  assert.ok(box.offset>0&&box.scale>0&&box.scale<1);
 }
});
test('loading flow moves upward diagonally and clears the central loader and text',()=>{
 for(const x of [184,208,1189,1213]){const a=loadingPoint(x,300),b=loadingPoint(x,600);assert.ok(b.y<a.y);assert.ok(b.x>a.x);
  for(let y=-120;y<=1020;y++){const p=loadingPoint(x,y);if(p.y>=320&&p.y<=620)assert.ok(p.x<470||p.x>970);}
 }
 const p=loadingPoint(720,450);assert.ok(Math.abs(p.x-720)<1e-10&&Math.abs(p.y-450)<1e-10);
});
test('fade regions travel continuously and return without a loop jump',()=>{
 for(let t=0;t<64;t+=.1){const a=fadeCenters(t),b=fadeCenters(t+.01);for(const key of Object.keys(a)){assert.ok(a[key]>=0&&a[key]<=100);assert.ok(Math.abs(a[key]-b[key])<.1);}}
 assert.notDeepEqual(fadeCenters(0),fadeCenters(4));
 for(const key of Object.keys(fadeCenters(0)))assert.ok(Math.abs(fadeCenters(0)[key]-fadeCenters(64)[key])<1e-10);
});

test('additional gradient centers travel against the original pair on horizontal and loading paths',()=>{
 for(let t=0;t<64;t+=.125){
  const a=fadeCenters(t),b=fadeCenters(t+.01);
  for(const [forward,reverse] of [['a','c'],['b','d'],['u','w'],['v','x']]){
   assert.ok((b[forward]-a[forward])*(b[reverse]-a[reverse])<=1e-10);
   assert.ok(Number.isFinite(a[reverse])&&a[reverse]>=0&&a[reverse]<=100);
  }
 }
 for(const key of Object.keys(fadeCenters(0)))assert.ok(Math.abs(fadeCenters(0)[key]-fadeCenters(64)[key])<1e-9);
});
