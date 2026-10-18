// Assignment availability belongs to tasks; it does not invent a request lifecycle transition.
export function requestAssignmentSummary(tasks){
 const pending=tasks.filter(task=>task.status==='Unassigned').length;
 const assigned=tasks.filter(task=>task.status==='Assigned').length;
 return {pending,assigned,total:tasks.length,complete:tasks.length>0&&assigned===tasks.length};
}
