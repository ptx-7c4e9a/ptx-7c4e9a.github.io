import {test} from 'node:test';
import assert from 'node:assert/strict';
import expanded from '../src/data/telemetry-series.json' with {type:'json'};
import baseline from '../src/data/telemetry-series.baseline.json' with {type:'json'};
import {minute} from '../src/ektp/telemetry.mjs';

test('C166 triples each synthetic channel without losing source anchors or adding discrete transitions',()=>{
 for(const original of baseline.channels){
  const channel=expanded.channels.find(c=>c.id===original.id);
  assert.equal(channel.samples.length,original.samples.length*3);
  for(const point of original.samples)assert.deepEqual(channel.samples.find(s=>s.time===point.time),point);
  channel.samples.forEach((s,i)=>{if(i)assert.ok(minute(s.time)>minute(channel.samples[i-1].time));});
  if(channel.discrete){for(const point of channel.samples){const old=original.samples.filter(s=>minute(s.time)<=minute(point.time)).at(-1);assert.equal(point.value,old.value);}}
 }
});
