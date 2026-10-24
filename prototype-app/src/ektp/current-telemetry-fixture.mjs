// Prepared prototype values, not terminal readings. Two fleet examples and six
// dense-map examples retain channel gaps: 153 of161 online records are complete.
const channelGaps=new Set(['demo-kzn-10','demo-ykt-10','demo-base-20','demo-base-40','demo-base-60','demo-base-80','demo-base-100','demo-convoy-20']);
export function prepareCurrentTelemetry(vehicle){
 if(!vehicle.id.startsWith('demo-'))return vehicle;
 const seed=[...vehicle.id].reduce((n,c)=>n+c.charCodeAt(0),0),van=vehicle.vehicleType==='Сервисный фургон';
 const sensors={...vehicle.sensors,battery:vehicle.sensors?.battery??(van?12.6:27.2)+seed%5/10};
 const prepared={...vehicle,fuel:vehicle.fuel??90+seed%111,fuelUnit:vehicle.fuelUnit||'л',sensors};
 if(channelGaps.has(vehicle.id)){delete prepared.fuel;delete prepared.sensors.battery;}
 return prepared;
}
