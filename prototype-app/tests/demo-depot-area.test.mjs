import test from 'node:test';
import assert from 'node:assert/strict';
import {demoDepotArea} from '../src/ektp/demo-depot-area.mjs';
import {denseMapVehicles} from '../src/ektp/dense-map-demo.mjs';
const inside=([x,y])=>{let hit=false;for(let i=0,j=demoDepotArea.length-1;i<demoDepotArea.length;j=i++){const [a,b]=demoDepotArea[i],[c,d]=demoDepotArea[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;};
test('illustrative depot boundary is closed, finite and contains all one hundred parked vehicles',()=>{
 assert.deepEqual(demoDepotArea[0],demoDepotArea.at(-1));
 assert.ok(demoDepotArea.every(p=>p.length===2&&p.every(Number.isFinite)));
 for(const v of denseMapVehicles.filter(v=>v.demoScenario==='base'))assert.ok(inside(v.demoCoordinates),v.id);
 assert.equal(inside([0,0]),false);
});
