import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

for(const kind of ['ektp','klk','klk-2'])test(`${kind}: structured diagrams preserve every text and illustrations resolve`,()=>{
 const doc=JSON.parse(fs.readFileSync(new URL(`../src/data/rationale-${kind}.json`,import.meta.url),'utf8'));
 assert.equal(doc.sections[0].name,'Решение задачи');
 for(const section of doc.sections){
  const consumed=new Set();
  for(const diagram of section.diagrams??[]){
   const references=[];
   const collect=node=>{references.push(node.title,...node.body??[]);if(node.label!==undefined)references.push(node.label);node.children?.forEach(collect);};
   if(diagram.root)collect(diagram.root);diagram.nodes.forEach(collect);
   const range=Array.from({length:diagram.end-diagram.start+1},(_,i)=>diagram.start+i);
   assert.deepEqual([...references].sort((a,b)=>a-b),range,`${section.name}: missing or duplicated diagram text`);
   for(const index of range){assert.ok(section.text[index]?.text);assert.ok(!consumed.has(index),'overlapping diagrams');consumed.add(index);}
  }
  for(const table of section.tables??[]){for(let i=table.start;i<table.start+table.columns*(table.rows+(table.header?1:0));i++)assert.ok(!consumed.has(i),'table/diagram overlap');}
  for(const illustration of section.illustrations??[]){
   assert.ok(section.text[illustration.before]&&(!consumed.has(illustration.before)||section.diagrams?.some(d=>d.start===illustration.before)),'illustration insertion must remain reachable');
   const bytes=fs.readFileSync(new URL('../public'+illustration.src,import.meta.url));
   assert.equal(bytes.subarray(1,4).toString(),'PNG');
   assert.equal(bytes.readUInt32BE(16),illustration.width);assert.equal(bytes.readUInt32BE(20),illustration.height);
   assert.ok(illustration.alt&&illustration.sourceNode);
  }
 }
});
