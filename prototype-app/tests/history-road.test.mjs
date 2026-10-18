import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compileRoad,poseAlong} from '../src/ektp/vehicle-motion.mjs';
import {historyPosition,historyRoad} from '../src/ektp/history-road.mjs';

test('subperiod slider starts/ends at its own temporal bounds and follows every intervening road bend',()=>{
 const road=compileRoad([[0,0],[0,.01],[.01,.01],[.01,.02]]),window={from:.25,to:.75};
 const path=historyRoad(road,window);
 assert.deepEqual(path[0],poseAlong(road,.25).coordinates);
 assert.deepEqual(path.at(-1),poseAlong(road,.75).coordinates);
 assert.ok(path.some(p=>p===road.path[1]));assert.ok(path.some(p=>p===road.path[2]));
 assert.equal(historyPosition(0,window),.25);assert.equal(historyPosition(1,window),.75);assert.equal(historyPosition(.5,window),.5);
 assert.equal(historyPosition(-1,window),.25);assert.equal(historyPosition(2,window),.75);
 assert.deepEqual(historyRoad(road),road.path);
});
