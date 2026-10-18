import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../src/data/klk.json' with {type:'json'};
import {assignTasks} from '../src/logic.mjs';
import {requestAssignmentSummary as summary} from '../src/klk/request-assignment-summary.mjs';

test('C206 task readiness is independent of request lifecycle before and after an actual assignment',()=>{
 const tasks=state=>state.tasks.filter(task=>task.requestId==='R1044');
 assert.deepEqual(summary(tasks(fixture)),{pending:1,assigned:0,total:1,complete:false});
 const next=assignTasks(fixture,'R1044',['T1044-1'],[{vehicleId:'V001',driverIds:['D001']}]);
 assert.deepEqual(summary(tasks(next)),{pending:0,assigned:1,total:1,complete:true});
 assert.equal(next.requests.find(request=>request.id==='R1044').status,'NEW');
});
test('C206 refused or missing tasks are not described as fully assigned',()=>{
 assert.deepEqual(summary([]),{pending:0,assigned:0,total:0,complete:false});
 assert.deepEqual(summary([{status:'Assigned'},{status:'REFUSED_DEMO'}]),{pending:0,assigned:1,total:2,complete:false});
 assert.deepEqual(summary([{status:'REFUSED_DEMO'}]),{pending:0,assigned:0,total:1,complete:false});
 assert.deepEqual(summary([{status:'Assigned'},{status:'Unassigned'}]),{pending:1,assigned:1,total:2,complete:false});
});
