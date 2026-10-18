import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mapFocusMargins,zoneBounds} from '../src/ektp/map-focus.mjs';

test('focused content fits the free map region beside a right inspector at desktop and tablet sizes',()=>{
 for(const [width,height] of [[1920,1080],[1440,900],[1024,900],[768,1024],[1024,768],[820,1180],[1180,820]]){
  const map={left:24,top:220,right:width-24,bottom:height-96};
  const panel={left:map.right-336,top:map.top+16,right:map.right-16,bottom:map.bottom-16};
  const [top,right,bottom,left]=mapFocusMargins(map,panel);
  const free={left:map.left+left,right:map.right-right,top:map.top+top,bottom:map.bottom-bottom};
  assert.ok(free.right<=panel.left-24);assert.ok(free.right-free.left>=96);assert.ok(free.bottom-free.top>=96);
  assert.ok((free.left+free.right)/2<panel.left);assert.equal(bottom,80);
 }
});

test('closing the inspector restores the map width and detached panels do not shift the target',()=>{
 const map={left:100,top:200,right:900,bottom:800};
 assert.deepEqual(mapFocusMargins(map,null),[24,24,80,24]);
 assert.deepEqual(mapFocusMargins(map,{left:900,top:220,right:1200,bottom:700}),[24,24,80,24]);
 assert.deepEqual(mapFocusMargins(map,{left:580,top:800,right:880,bottom:1000}),[24,24,80,24]);
 const margins=mapFocusMargins(map,{left:110,top:210,right:890,bottom:790});
 assert.ok(800-margins[1]-margins[3]>=96);
});

test('all operating-zone vertices are inside the fitted bounds and geometry matches the map fixture',()=>{
 const zones=JSON.parse(readFileSync(new URL('../src/data/zones.json',import.meta.url)));
 const geography=JSON.parse(readFileSync(new URL('../src/data/geography.json',import.meta.url)));
 for(const zone of zones.zones){
  assert.deepEqual(zone.geometry,geography.zones.find(z=>z.id===zone.id).polygon);
  const [[west,south],[east,north]]=zoneBounds(zone.geometry);
  assert.ok(east>west&&north>south);
  for(const [lng,lat] of zone.geometry)assert.ok(lng>=west&&lng<=east&&lat>=south&&lat<=north);
  assert.notDeepEqual([(west+east)/2,(south+north)/2],zone.geometry[0]);
 }
 assert.throws(()=>zoneBounds([]),TypeError);assert.throws(()=>zoneBounds([[0,1],[1,2],[NaN,3]]),TypeError);
});
