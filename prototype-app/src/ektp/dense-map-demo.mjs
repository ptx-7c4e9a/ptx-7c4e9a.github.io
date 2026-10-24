import {parkingPose} from './dense-map-parking.mjs';
import {prepareCurrentTelemetry} from './current-telemetry-fixture.mjs';
import road from './dense-map-road.json' with {type:'json'};
// Explicit illustrative scenario; never merged into the operational 44-vehicle fleet,
// BI totals, assignment records, archive telemetry or availability calculations.
export const denseMapScenario={
 id:'koledino-demo',title:'База и автоколонна',center:[37.6147,55.39675],zoom:16,
 baseCenter:[37.6160,55.3965],
 baseSource:'User-marked clearing east of M2, screenshot 2026-10-23',
 parkingSource:null,
 notice:'Демонстрационный сценарий: 100 ТС на базе и 20 ТС в колонне. Это не данные организаций на карте.',
};
export const denseConvoyRoad=road.coordinates;
const demoTypes=[
 {vehicleType:'Автотопливозаправщик',model:'КамАЗ-43118 (АТЗ-12)'},
 {vehicleType:'Автотопливозаправщик · полуприцеп',model:'Тягач с полуприцепом-цистерной'},
 {vehicleType:'Вахтовый автобус',model:'Вахтовый автобус · демо'},
 {vehicleType:'Сервисный фургон',model:'Сервисный фургон · демо'},
 {vehicleType:'Бортовой грузовик',model:'Бортовой грузовик · демо'},
];
// Ten homogeneous lots follow the access track, with inward-facing rows and
// angled bays for smaller vehicles. This is illustrative parking geography.
const parkingTypes=[demoTypes[1],demoTypes[0],demoTypes[4],demoTypes[2],demoTypes[3]];
const parkingTitles=['Тягачи с цистерной','Автотопливозаправщики','Бортовые грузовики','Вахтовые автобусы','Сервисные фургоны'];
const parked=Array.from({length:100},(_,i)=>{
 const group=Math.floor(i/10),slot=i%10,typeIndex=group%5;
 const type=parkingTypes[typeIndex],owned=group<5;
 const kind=owned?'Собственное':'Наёмное',groupLabel=type.vehicleType+' · '+(owned?'Собственный парк':'Наёмный парк');
 const pose=parkingPose(group,slot);
 return {id:'demo-base-'+(i+1),plate:'А'+String(i+1).padStart(3,'0')+'АТ 777',...type,kind,city:'Поливаново · демо',ownerName:groupLabel+' · демо',speed:0,signal:'Демонстрационные данные',connectionState:'online',fuel:type.vehicleType==='Сервисный фургон'?undefined:55+i%30,fuelUnit:'л',sensors:{ignition:false,rpm:0,coolant:34+i%6,battery:type.vehicleType==='Сервисный фургон'?12.6:24.6,gps:true},demoScenario:'base',demoGroup:'parking-'+(group+1),demoGroupTitle:parkingTitles[typeIndex],demoGroupLabel:groupLabel,demoCoordinates:pose.coordinates,demoHeading:pose.heading};
});
const convoy=Array.from({length:20},(_,i)=>({
 id:'demo-convoy-'+(i+1),plate:'К'+String(i+1).padStart(3,'0')+'АТ 777',...demoTypes[i%demoTypes.length],kind:i%3===0?'Наёмное':'Собственное',city:'М2 · демо',ownerName:i%3===0?'Наёмный парк · демо':'Собственный парк · демо',speed:64,signal:'Демонстрационные данные',connectionState:'online',fuel:i%5===3?undefined:68-i,sensors:{ignition:true,rpm:1450,coolant:82,battery:i%5===3?13.8:27.5,gps:true},demoScenario:'convoy',demoOffsetMetres:900+i*110,
}));
export const denseMapVehicles=[...parked,...convoy].map(prepareCurrentTelemetry);
