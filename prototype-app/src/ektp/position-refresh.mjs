// C255-C256: local prototype response, separate from historical telemetry.
export function refreshedPosition(vehicle,now=new Date()){
 const seed=[...vehicle.id].reduce((sum,c)=>sum+c.charCodeAt(0),0);
 const speed=60+seed%71;
 const time=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now);
 const day=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',day:'2-digit',month:'2-digit'}).format(now);
 return {patch:{speed,connectionState:'online',signal:day+' · '+time,sensors:{...vehicle.sensors,ignition:true,rpm:900+speed*10}},time};
}
