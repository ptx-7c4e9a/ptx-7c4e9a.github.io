import {rankCandidates} from '../logic.mjs';

// Prepared targets are explicit. Never substitute another target or estimate from animation.
export function preparedArrivals(targets,targetId,selectedIds,allowedIds){
 const allowed=new Set(allowedIds);
 return rankCandidates(targets[targetId]||[],selectedIds.filter(id=>allowed.has(id)));
}
