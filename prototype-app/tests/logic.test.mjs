import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assignTasks,selectRows,compare,rankCandidates,validRange,formatPeriod,formatPeriodButton,formatDateTimeInput,parseDateTimeInput,pointAlong,fitToolbar} from '../src/logic.mjs';
const fixture=JSON.parse(fs.readFileSync(new URL('../src/data/klk.json',import.meta.url)));
const resource=[{vehicleId:'V001',driverIds:['D001'],terminalIds:[],waybill:{number:'123'}}];
test('assignment is immutable and changes only chosen task, preserves other canonical assignments',()=>{const before=JSON.stringify(fixture);const next=assignTasks(fixture,'R1042',['T1042-1'],resource);assert.equal(JSON.stringify(fixture),before);assert.equal(next.tasks.find(t=>t.id==='T1042-1').status,'Assigned');assert.deepEqual(next.tasks.filter(t=>t.id!=='T1042-1'),fixture.tasks.filter(t=>t.id!=='T1042-1'));assert.deepEqual(next.assignments.slice(0,-1),fixture.assignments);resource[0].waybill.number='changed';assert.equal(next.assignments.at(-1).resourceRows[0].waybill.number,'123');});
test('assignment rejects foreign task, absent resources and incomplete rows',()=>{assert.throws(()=>assignTasks(fixture,'R1042',['T1043-1'],resource));assert.throws(()=>assignTasks(fixture,'R1042',['T1042-1'],[{vehicleId:'missing',driverIds:['D001']} ]));assert.throws(()=>assignTasks(fixture,'R1042',['T1042-1'],[{vehicleId:'V001',driverIds:[]} ]));});
test('partial replacement does not delete other tasks of a multi-task assignment',()=>{const data=structuredClone(fixture);data.assignments=[{id:'multi',selectedTaskIds:['T1042-1','T1043-1'],resourceRows:resource}];const next=assignTasks(data,'R1042',['T1042-1'],resource);assert.deepEqual(next.assignments[0].selectedTaskIds,['T1043-1']);});
test('queries match plates with/without internal spaces; filters intersect',()=>{const rows=[{id:'1',plate:'Р394ОК 85',city:'Москва'},{id:'2',plate:'Р394ОК 85',city:'Казань'}];assert.equal(selectRows(rows,{query:'Р394ОК85',filters:{city:'Москва'}}).length,1);assert.equal(selectRows(rows,{query:'unknown'}).length,0);});
test('numeric sorting, null last in both directions, stable ID ties',()=>{assert.ok(compare(2,10)<0);for(const d of [1,-1])assert.ok(compare(null,3,d)>0);assert.deepEqual(selectRows([{id:'b',n:3},{id:'a',n:3}],{sortKey:'n'}).map(r=>r.id),['a','b']);});
test('ETA is ranked by time, stale null last, not shortest distance',()=>{const rows=[{vehicleId:'a',etaSeconds:20,distanceM:1},{vehicleId:'b',etaSeconds:10,distanceM:100},{vehicleId:'c',etaSeconds:null}];assert.deepEqual(rankCandidates(rows,['a','b','c']).map(r=>r.vehicleId),['b','a','c']);});
test('period validation rejects missing, invalid and reversed ranges',()=>{assert.ok(validRange('2026-10-13T08:00','2026-10-13T12:00'));for(const r of [['',''],['bad','bad'],['2026-10-14','2026-10-13']])assert.equal(validRange(...r),false);});
test('route interpolation clamps endpoints and stays on segment',()=>{const p=[[37,55],[38,55]];assert.deepEqual(pointAlong(p,-1),p[0]);assert.deepEqual(pointAlong(p,2),p[1]);assert.deepEqual(pointAlong(p,.5),[37.5,55]);});
test('toolbar keeps source sizes, drops low-priority actions and restores order on resize',()=>{const actions=[{id:'current',width:170,priority:0},{id:'period',width:180,priority:2},{id:'zones',width:130,priority:1}];assert.deepEqual(fitToolbar(actions,500),{visible:['current','period','zones'],hidden:[]});assert.deepEqual(fitToolbar(actions,320),{visible:['period','zones'],hidden:['current']});assert.deepEqual(fitToolbar(actions,250),{visible:['period'],hidden:['current','zones']});assert.deepEqual(fitToolbar(actions,100),{visible:[],hidden:['current','period','zones']});assert.deepEqual(actions.map(a=>a.width),[170,180,130]);});

test('period label identifies exact dates, years and time boundaries without date conversion',()=>{
 assert.equal(formatPeriod({from:'2026-10-13T08:00',to:'2026-10-13T12:00'}),'13.10.2026 · 08:00–12:00');
 assert.equal(formatPeriod({from:'2026-12-31T23:30',to:'2027-01-01T01:15'}),'31.12.2026, 23:30 — 01.01.2027, 01:15');
});

test('manual date entry round trips leap dates and rejects impossible dates and partial values',()=>{
 const iso='2028-02-29T23:59';assert.equal(parseDateTimeInput(formatDateTimeInput(iso)),iso);
 for(const value of ['29.02.2027 12:00','31.04.2026 12:00','13.10.2026 24:00','13.10.2026 12:60','13.10.2026','13.10.'])assert.equal(parseDateTimeInput(value),'');
 assert.equal(parseDateTimeInput('13.10.2026',true),'2026-10-13');
});


test('period buttons retain both endpoints and years across a year boundary without changing the range',()=>{
 const day={from:'2026-10-13T08:00',to:'2026-10-13T12:00'};
 assert.equal(formatPeriodButton(day),'13 октября · 08:00–12:00');
 const multiple={from:'2026-10-05T08:00',to:'2026-10-13T12:00'},snapshot=JSON.stringify(multiple);
 assert.equal(formatPeriodButton(multiple),'5 окт., 08:00 — 13 окт., 12:00');
 assert.equal(JSON.stringify(multiple),snapshot);
 const years=formatPeriodButton({from:'2026-12-31T23:00',to:'2027-01-01T02:00'});
 for(const part of ['2026','2027','23:00','02:00'])assert.ok(years.includes(part));
});
