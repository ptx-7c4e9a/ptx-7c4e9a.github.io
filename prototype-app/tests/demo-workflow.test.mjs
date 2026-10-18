import test from 'node:test';
import assert from 'node:assert/strict';
import {changeWorkflow,normalizeWorkflow,togglePageSelection} from '../src/ui/demo-workflow.mjs';
test('demo deletion preserves deferred membership for recovery and never mutates input',()=>{
 const valid=['A','B','C'],source={deferred:['A'],deleted:[]},copy=structuredClone(source);
 const deleted=changeWorkflow(source,'delete',['A','C','missing'],valid);
 assert.deepEqual(source,copy);assert.deepEqual(deleted,{deferred:['A'],deleted:['A','C']});
 assert.deepEqual(changeWorkflow(JSON.parse(JSON.stringify(deleted)),'restore',['A'],valid),{deferred:['A'],deleted:['C']});
});
test('deferring and resuming selected IDs cannot affect other or stale IDs',()=>{
 const first=changeWorkflow({deferred:['B'],deleted:['C']},'defer',['A','A','C','missing'],['A','B','C']);
 assert.deepEqual(first,{deferred:['B','A'],deleted:['C']});
 assert.deepEqual(changeWorkflow(first,'resume',['A'],['A','B','C']),{deferred:['B'],deleted:['C']});
 assert.deepEqual(normalizeWorkflow({deferred:['A','A','old'],deleted:['B','old']},['A','B']),{deferred:['A'],deleted:['B']});
});
test('header checkbox selects just the visible page without losing other page selection',()=>{
 assert.deepEqual(togglePageSelection(['A'],['B','C'],true),['A','B','C']);
 assert.deepEqual(togglePageSelection(['A','B','C'],['B','C'],false),['A']);
});
