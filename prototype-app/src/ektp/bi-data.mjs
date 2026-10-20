export const biPages=['reports-overview','reports-manager','reports-fuel','reports-hired','reports-owned'];
export const biNavigation=[
 {id:'reports-overview',label:'Обзор отчётов'},
 {id:'reports-manager',label:'Руководитель'},
 {id:'reports-fuel',label:'Топливо'},
 {id:'reports-hired',label:'Наёмный парк'},
 {id:'reports-owned',label:'Собственный парк'},
 {id:'reports',label:'Топливные транзакции'},
];


// Transcribed from the supplied BI screenshots. Never merge these corporate
// aggregates with the prototype's 44-vehicle demonstration fleet.
export const biSource = {
 messageId: '1a158e9fea33dc39', received: '20.10.2026',
 manager: 'image001.png', fuel: 'image002.png',
 hired: 'image003.png', owned: 'image005.png',
 period: 'Период исходного среза', exportTimestamp: null,
};
export const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
export const efficiency = [
 {id:'2026',name:'2026',values:[38,41,41,42,41,42,42,41,43,42,null,null]},
 {id:'2025',name:'2025',values:[29,31,33,35,34,35,36,36,36,36,36,38]},
];
export const managerSummary = { vehicles:20629,score:6,scoreMax:8.5,currentEfficiency:42,previousEfficiency:36,delta:6 };
export const assignmentMetrics = [
 {id:'assigned',label:'Задания с назначенными ТС',value:98,unit:'%',target:'Цель — выше 99%',status:'Ниже цели',tone:'alert'},
 {id:'completed',label:'Завершённые задания',value:80,unit:'%',target:'Цель — выше 95%',status:'Ниже цели',tone:'alert'},
 {id:'mileage',label:'Отклонение по пробегу',value:4,unit:'%',target:'Допустимо от −5 до +5%',status:'В пределах цели',tone:'success'},
 {id:'equipment',label:'Отклонение по верхнему оборудованию',value:-4,unit:'%',target:'Допустимо от −5 до +5%',status:'В пределах цели',tone:'success'},
];
// Ranking shown on image001. Tied ranks and source deltas are retained.
export const managerOrganizations = [
 {id:'139',name:'АО «Новокуйбышевская нефтехимическая компания»',rank:1,delta:61,previous:30,current:91},
 {id:'55',name:'ЗАО «Капитальный ремонт скважин»',rank:2,delta:25,previous:23,current:48},
 {id:'58',name:'ЗАО «Удмуртнефть-Бурение»',rank:3,delta:22,previous:33,current:55},
 {id:'152',name:'ООО «РН-Проектирование Добыча»',rank:4,delta:21,previous:39,current:60},
 {id:'17',name:'АО «Тюменнефтегаз»',rank:4,delta:21,previous:13,current:34},
 {id:'26',name:'ООО «Кынско-Часельское нефтегаз»',rank:5,delta:18,previous:16,current:34},
 {id:'42',name:'ООО «РН-Сервис»',rank:6,delta:16,previous:39,current:55},
 {id:'124',name:'АО «Новокуйбышевский НПЗ»',rank:6,delta:16,previous:47,current:63},
 {id:'200',name:'ПАО «АНК „Башнефть“»',rank:7,delta:13,previous:23,current:36},
 {id:'6',name:'АО «Самотлорнефтегаз»',rank:8,delta:12,previous:53,current:65},
];
export const fuelSummary = { tonnes:14935,vehicles:23084,diesel:12972,petrol:1963 };
export const fuelRegions = [
 {id:'khmao',name:'ХМАО',vehicles:8100,diesel:4819,petrol:743},
 {id:'krasnoyarsk',name:'Красноярский край',vehicles:2347,diesel:1842,petrol:141},
 {id:'bashkiria',name:'Башкирия',vehicles:3653,diesel:1549,petrol:328},
 {id:'samara',name:'Самарская обл.',vehicles:2112,diesel:906,petrol:289},
 {id:'orenburg',name:'Оренбургская обл.',vehicles:976,diesel:600,petrol:106},
];
// Values are independently rounded in the source. Preserve published totals,
// including 1 115 + 941 versus the displayed 2 055; do not silently repair them.
export const fuelOrganizations = [
 {id:'1',name:'ООО «РН-Юганскнефтегаз»',vehicles:3406,dieselMileage:1115,dieselEquipment:941,diesel:2055,petrol:393},
 {id:'2',name:'ООО «РН-Ванкор»',vehicles:710,dieselMileage:146,dieselEquipment:519,diesel:665,petrol:68},
 {id:'3',name:'ООО «Башнефть-Добыча»',vehicles:135,dieselMileage:15,dieselEquipment:11,diesel:26,petrol:16},
 {id:'4',name:'АО «Самаранефтегаз»',vehicles:899,dieselMileage:248,dieselEquipment:150,diesel:399,petrol:193},
 {id:'5',name:'АО «Оренбургнефть»',vehicles:760,dieselMileage:277,dieselEquipment:128,diesel:405,petrol:87},
 {id:'6',name:'АО «Самотлорнефтегаз»',vehicles:1064,dieselMileage:232,dieselEquipment:130,diesel:363,petrol:143},
];

// image003 is a separate BI slice. Its annual efficiency and customer-counted
// fleet must not replace or be combined with image001's manager summary.
export const hiredSummary={assignedVehicles:20629,customerVehicles:21560,score:6,y2024:27,previous:37,current:42};
export const hiredOrganizations=[
 {id:'1',name:'ООО «РН-Юганскнефтегаз»',vehicles:3834,y2024:34,y2025:44,y2026:44,score:3.5,assigned:99,completed:83,mileage:4,equipment:-22},
 {id:'2',name:'ООО «РН-Ванкор»',vehicles:1969,y2024:14,y2025:27,y2026:34,score:5.4,assigned:100,completed:97,mileage:3,equipment:8},
 {id:'3',name:'ООО «Башнефть-Добыча»',vehicles:1753,y2024:50,y2025:62,y2026:58,score:6,assigned:98,completed:81,mileage:0,equipment:3},
 {id:'4',name:'АО «Самаранефтегаз»',vehicles:1141,y2024:51,y2025:53,y2026:56,score:5.4,assigned:100,completed:97,mileage:10,equipment:-7},
 {id:'5',name:'АО «Оренбургнефть»',vehicles:759,y2024:46,y2025:47,y2026:55,score:3.5,assigned:100,completed:93,mileage:9,equipment:-2},
 {id:'6',name:'АО «Самотлорнефтегаз»',vehicles:1063,y2024:48,y2025:53,y2026:65,score:6.5,assigned:99,completed:88,mileage:1,equipment:1},
 {id:'7',name:'ООО «РН-Пурнефтегаз»',vehicles:436,y2024:37,y2025:39,y2026:46,score:6.5,assigned:99,completed:90,mileage:2,equipment:2},
];
export const ownedSummary={vehicles:28351,operating:18128,assigned:8498,score:3.7,scoreMax:7.5};
export const ownedMetrics=[
 {id:'usage',label:'Коэффициент эксплуатации',value:30,target:80,rule:'above',goal:'Выше 80%'},
 {id:'tasks',label:'Оформление заданий',value:57,target:80,rule:'above',goal:'Выше 80%'},
 {id:'closed',label:'Закрытие заданий',value:95,target:80,rule:'above',goal:'Выше 80%'},
 {id:'waybills',label:'Оформление путевых листов',value:29,target:90,rule:'above',goal:'Выше 90%'},
 {id:'closedWaybills',label:'Закрытие путевых листов',value:68,goal:'Цель требует уточнения',rule:'unknown'},
 {id:'mileage',label:'Отклонение по пробегу',value:-5426,target:5,rule:'range',goal:'От −5 до +5%'},
];
// Only fully visible fields/rows are transcribed. Clipped integral scores and
// N/A values remain unavailable; they are never inferred from other reports.
export const ownedOrganizations=[
 {id:'1',name:'ООО «РН-Юганскнефтегаз»',vehicles:8,assigned:5,usage:63,tasks:62,closed:100,waybills:32,closedWaybills:58,mileage:294,movement:10,hours:0.2},
 {id:'2',name:'ООО «РН-Ванкор»',vehicles:5,assigned:2,usage:40,tasks:84,closed:96,waybills:18,closedWaybills:73,mileage:0,movement:null,hours:0.4},
 {id:'3',name:'ООО «Башнефть-Добыча»',vehicles:96,assigned:47,usage:49,tasks:31,closed:83,waybills:23,closedWaybills:9,mileage:null,movement:null,hours:null},
 {id:'5',name:'АО «Оренбургнефть»',vehicles:2,assigned:1,usage:50,tasks:6,closed:100,waybills:3,closedWaybills:100,mileage:null,movement:null,hours:null},
];
export function efficiencyComparison(index){
 const current=efficiency[0].values[index],previous=efficiency[1].values[index];
 return {current,previous,delta:current===null||previous===null?null:current-previous};
}

export const number = value => new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(value).replace('-', '−');
export function filterBiRows(rows,query='',id='') {
 const q=query.trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е');
 return rows.filter(row=>(!id||row.id===id)&&(!q||row.name.toLocaleLowerCase('ru-RU').replace(/ё/g,'е').includes(q)));
}
export function chartPoints(values,width=720,height=220,max=60) {
 const left=40,right=16,top=12,bottom=32;
 return values.map((value,index)=>value===null?null:{
  x:left+index*(width-left-right)/(values.length-1),
  y:top+(1-value/max)*(height-top-bottom),value,index,
 });
}
export function csvText(rows,columns) {
 const cell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
 return '\ufeff'+[columns.map(c=>cell(c.label)).join(';'),...rows.map(row=>columns.map(c=>cell(row[c.key])).join(';'))].join('\r\n');
}
