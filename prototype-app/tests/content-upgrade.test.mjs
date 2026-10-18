import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {upgradeDemoContent} from '../src/klk/content-upgrade.mjs';

const fixture=JSON.parse(fs.readFileSync(new URL('../src/data/klk.json',import.meta.url)));
const added=new Set(fixture.equipmentContentProvenance.addedTerminalIds);
function oldState(){const d=structuredClone(fixture);delete d.demoContentRevision;delete d.equipmentContentProvenance;d.terminals=d.terminals.filter(t=>!added.has(t.id));for(const v of d.vehicles)v.terminalLinks=v.terminalLinks.filter(l=>!added.has(l.terminalId));return d;}

test('equipment supplement preserves saved work, existing relationships and source input',()=>{
 const saved=oldState();saved.tasks[0].status='Assigned';saved.assignments.push({id:'SAVED',selectedTaskIds:[saved.tasks[0].id],resourceRows:[{vehicleId:'V009',driverIds:['D009'],waybill:{number:'saved'}}]});
 const before=structuredClone(saved),next=upgradeDemoContent(saved,fixture);
 assert.deepEqual(saved,before);assert.deepEqual(next.tasks,before.tasks);assert.deepEqual(next.assignments,before.assignments);assert.deepEqual(next.drivers,before.drivers);
 assert.equal(next.terminals.length,25);assert.equal(next.vehicles.filter(v=>v.terminalLinks.length).length,23);
 for(const v of before.vehicles)if(v.terminalLinks.length)assert.deepEqual(next.vehicles.find(n=>n.id===v.id),v);
 assert.deepEqual(next.vehicles.filter(v=>!v.terminalLinks.length).map(v=>v.id),['V003','V005']);
 assert.equal(new Set(next.terminals.map(t=>t.id)).size,next.terminals.length);
 for(const v of next.vehicles)for(const link of v.terminalLinks)assert.ok(next.terminals.some(t=>t.id===link.terminalId));
});
test('equipment upgrade is idempotent and does not replace a saved custom link',()=>{
 const saved=oldState();saved.vehicles.find(v=>v.id==='V007').terminalLinks=[{terminalId:'AT001',isPrimary:false,isUsed:false}];
 const next=upgradeDemoContent(saved,fixture);assert.deepEqual(next.vehicles.find(v=>v.id==='V007').terminalLinks,saved.vehicles.find(v=>v.id==='V007').terminalLinks);
 assert.strictEqual(upgradeDemoContent(next,fixture),next);
});
test('a saved terminal ID collision is preserved without attaching the unrelated authored link',()=>{
 const saved=oldState();saved.terminals.push({id:'AT013',atCode:'USER-OWNED'});const next=upgradeDemoContent(saved,fixture);
 assert.equal(next.terminals.find(t=>t.id==='AT013').atCode,'USER-OWNED');assert.deepEqual(next.vehicles.find(v=>v.id==='V007').terminalLinks,[]);
});
