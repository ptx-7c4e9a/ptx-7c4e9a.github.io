import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {staticRoutes} from '../scripts/prepare-static.mjs';

test('four launcher choices have distinct prototype and rationale destinations with a shared tablet minimum',async()=>{
 const launcher=JSON.parse(await readFile(new URL('../src/data/launcher.json',import.meta.url),'utf8'));
 assert.deepEqual(launcher.products.map(p=>p.id),['ektp','ektp-2','klk-1','klk-2']);
 for(const field of ['proposedCodeRoute','rationaleCodeRoute']){
  assert.equal(new Set(launcher.products.map(p=>p[field])).size,4);
  for(const product of launcher.products)assert.ok(staticRoutes.includes(product[field]),`${product.id}: missing static route ${product[field]}`);
 }
 const second=JSON.parse(await readFile(new URL('../src/data/rationale-ektp-2.json',import.meta.url),'utf8'));
 assert.equal(second.variant,'2');assert.equal(second.prototypeRoute,launcher.products[1].proposedCodeRoute);
 assert.ok(second.sections.some(section=>section.tables?.some(table=>table.columns===3)));
 assert.deepEqual(launcher.viewport.supportedWidths,[1920,1440,1024,768]);
 assert.equal(launcher.viewport.minimumWidth,Math.min(...launcher.viewport.supportedWidths));
 assert.equal(launcher.viewport.phoneVersion,false);
});
