// User-authorized local demo workflow; never changes source lifecycle or linked records.
export const emptyWorkflow=()=>({deferred:[],deleted:[]});
export function normalizeWorkflow(value,ids){
 const valid=new Set(ids),deleted=[...new Set(value?.deleted||[])].filter(id=>valid.has(id));
 return {deleted,deferred:[...new Set(value?.deferred||[])].filter(id=>valid.has(id))};
}
export function changeWorkflow(value,action,ids,validIds){
 const current=normalizeWorkflow(value,validIds),chosen=new Set(ids.filter(id=>validIds.includes(id)));
 if(action==='defer')current.deferred=[...new Set([...current.deferred,...chosen])].filter(id=>!current.deleted.includes(id));
 if(action==='resume')current.deferred=current.deferred.filter(id=>!chosen.has(id));
 if(action==='delete')current.deleted=[...new Set([...current.deleted,...chosen])];
 if(action==='restore')current.deleted=current.deleted.filter(id=>!chosen.has(id));
 return current;
}
export function togglePageSelection(selected,pageIds,checked){
 return checked?[...new Set([...selected,...pageIds])]:selected.filter(id=>!pageIds.includes(id));
}
