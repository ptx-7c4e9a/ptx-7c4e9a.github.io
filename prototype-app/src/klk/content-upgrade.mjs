// Add the C175 authored equipment supplement without resetting saved assignments.
export function upgradeDemoContent(saved,fixture){
 const target=fixture.demoContentRevision||0;
 if((saved.demoContentRevision||0)>=target)return saved;
 const next=structuredClone(saved),ids=new Set(fixture.equipmentContentProvenance?.addedTerminalIds||[]),usableIds=new Set();
 next.terminals||=[];
 for(const terminal of fixture.terminals||[])if(ids.has(terminal.id)){
  const existing=next.terminals.find(t=>t.id===terminal.id);
  if(!existing)next.terminals.push(structuredClone(terminal));
  if(!existing||existing.atCode===terminal.atCode)usableIds.add(terminal.id);
 }
 for(const vehicle of next.vehicles||[]){
  const authored=fixture.vehicles.find(v=>v.id===vehicle.id)?.terminalLinks?.filter(link=>usableIds.has(link.terminalId))||[];
  if(!vehicle.terminalLinks?.length&&authored.length)vehicle.terminalLinks=structuredClone(authored);
 }
 next.demoContentRevision=target;
 next.equipmentContentProvenance=structuredClone(fixture.equipmentContentProvenance);
 return next;
}
