import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {biNavigation,biPages,chartPoints,csvText,efficiency,efficiencyComparison,filterBiRows,fuelOrganizations,fuelRegions,fuelSummary,hiredOrganizations,hiredSummary,managerOrganizations,managerSummary,ownedMetrics,ownedOrganizations,ownedSummary} from '../src/ektp/bi-data.mjs';

test('BI source originals match saved email attachments; summaries keep their own scope',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../../ScreenShorts/bi-source-manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.messageId,'1a158e9fea33dc39');
 assert.equal(manifest.files.length,12);
 for(const file of manifest.files){
  const path=new URL('../../ScreenShorts/'+file.file,import.meta.url);
  assert.equal(statSync(path).size,file.bytes);
  assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),file.sha256);
 }
 assert.equal(managerSummary.vehicles,20629);
 assert.equal(managerSummary.currentEfficiency-managerSummary.previousEfficiency,managerSummary.delta);
 assert.equal(fuelSummary.diesel+fuelSummary.petrol,fuelSummary.tonnes);
 assert.ok(fuelRegions.reduce((sum,row)=>sum+row.diesel,0)<fuelSummary.diesel);
 assert.ok(fuelOrganizations.reduce((sum,row)=>sum+row.vehicles,0)<fuelSummary.vehicles);
 // Rounded subtotals are facts from the screenshot, not an invitation to fix its total.
 assert.equal(fuelOrganizations[0].diesel,2055);
 assert.equal(fuelOrganizations[0].dieselMileage+fuelOrganizations[0].dieselEquipment,2056);
 for(const row of managerOrganizations)assert.equal(row.current-row.previous,row.delta);
});

test('BI filtering and CSV export contain only the available selected rows, without changing source',()=>{
 const original=JSON.stringify(fuelRegions);
 assert.deepEqual(filterBiRows(fuelRegions,'  ХМАО  ').map(r=>r.id),['khmao']);
 assert.deepEqual(filterBiRows(fuelRegions,'Самарская','khmao'),[]);
 assert.equal(filterBiRows(fuelRegions,'несуществующий регион').length,0);
 assert.equal(filterBiRows(fuelRegions).length,5);
 const columns=[{key:'name',label:'Регион'},{key:'diesel',label:'ДТ, т'}];
 const exported=csvText(filterBiRows(fuelRegions,'','khmao'),columns);
 assert.equal(exported,'\ufeff"Регион";"ДТ, т"\r\n"ХМАО";"4819"');
 assert.equal(csvText([{name:'Имя "А"\nстрока',diesel:0}],columns),'\ufeff"Регион";"ДТ, т"\r\n"Имя ""А""\nстрока";"0"');
 assert.equal(JSON.stringify(fuelRegions),original);
});

test('BI plot distinguishes missing months from zero and keeps a zero-based percentage axis',()=>{
 assert.deepEqual(efficiency[0].values.slice(-2),[null,null]);
 assert.equal(efficiency[1].values.length,12);
 const points=chartPoints([0,60,null],720,260,60);
 assert.equal(points[0].y,228);
 assert.equal(points[1].y,12);
 assert.equal(points[2],null);
 assert.equal(chartPoints(efficiency[0].values).filter(Boolean).length,10);
});

test('Monthly inspection compares the hovered month, while missing current months have no invented delta',()=>{
 assert.deepEqual(efficiencyComparison(0),{current:38,previous:29,delta:9});
 assert.deepEqual(efficiencyComparison(9),{current:42,previous:36,delta:6});
 assert.deepEqual(efficiencyComparison(10),{current:null,previous:36,delta:null});
 assert.deepEqual(efficiencyComparison(11),{current:null,previous:38,delta:null});
});

test('Four BI reports retain separate source scopes and ambiguous own-fleet values',()=>{
 assert.equal(biPages.length,5);
 assert.equal(new Set(biNavigation.map(r=>r.id)).size,6);
 assert.notEqual(hiredSummary.previous,managerSummary.previousEfficiency);
 assert.equal(hiredSummary.customerVehicles,21560);
 assert.equal(hiredOrganizations.length,7);
 assert.equal(ownedSummary.vehicles,28351);
 assert.equal(ownedOrganizations.length,4);
 assert.equal(ownedOrganizations[2].mileage,null);
 assert.equal(ownedMetrics.find(r=>r.id==='mileage').value,-5426);
 assert.equal(ownedMetrics.find(r=>r.id==='closedWaybills').rule,'unknown');
 assert.ok(ownedOrganizations.reduce((sum,r)=>sum+r.vehicles,0)<ownedSummary.vehicles);
});
