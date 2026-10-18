import test from 'node:test';
import assert from 'node:assert/strict';
import {pageItems} from '../src/ui/pagination.mjs';

test('pagination retains real boundaries and nearby pages without duplicate or unavailable destinations',()=>{
 assert.deepEqual(pageItems(0,3),[0,1,2]);
 assert.deepEqual(pageItems(50,1),[0]);
 for(let total=8;total<=100;total++)for(let current=0;current<total;current++){
  const items=pageItems(current,total),pages=items.filter(n=>typeof n==='number');
  assert.equal(pages[0],0);assert.equal(pages.at(-1),total-1);assert.ok(pages.includes(current));
  assert.equal(new Set(pages).size,pages.length);assert.ok(items.length<=9);
  assert.ok(pages.every(n=>n>=0&&n<total));
 }
});
