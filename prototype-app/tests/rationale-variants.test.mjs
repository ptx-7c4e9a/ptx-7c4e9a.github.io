import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

test('both standalone readers retain every verified Figma text and source link',()=>{
 const packet=fs.readFileSync(new URL('../../KLK/prototype/standalone-rationales-c250-2026-10-18/live-documents.json',import.meta.url));
 const docs=JSON.parse(packet),hash=createHash('sha256').update(packet).digest('hex');
 const texts=n=>n.type==='TEXT'?[n]:n.kind?[]:(n.children||[]).flatMap(texts);
 for(const source of docs){
  const variant=source.variant==='A'?'1':'2';
  const reader=JSON.parse(fs.readFileSync(new URL(`../src/data/rationale-klk${variant==='2'?'-2':''}.json`,import.meta.url),'utf8'));
  const native=JSON.parse(fs.readFileSync(new URL(`../qa/c250-klk-variant-rationales-2026-10-18/figma-live-${source.variant}.json`,import.meta.url),'utf8'));
  assert.equal(reader.id,source.id);assert.equal(reader.variant,variant);assert.equal(reader.c250Source.sha256,hash);
  const actual=new Map(reader.sections.flatMap(s=>s.text).map(t=>[t.id,t]));
  const expected=[...source.sections.flatMap(s=>texts(s.tree)),...native.native.flatMap(n=>n.texts)];
  assert.equal(actual.size,expected.length);
  for(const row of expected){assert.equal(actual.get(row.id)?.text,row.text,`Lost Figma text ${row.id}`);if(row.hyperlink?.type==='URL')assert.equal(actual.get(row.id)?.href,row.hyperlink.value);}
 }
 assert.notEqual(docs[0].id,docs[1].id);
 const launcher=JSON.parse(fs.readFileSync(new URL('../src/data/launcher.json',import.meta.url),'utf8'));
 assert.deepEqual(launcher.products.slice(1).map(p=>p.rationaleCodeRoute),['/rationale/klk/1','/rationale/klk/2']);
});
